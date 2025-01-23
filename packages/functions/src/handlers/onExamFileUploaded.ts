/* eslint-disable max-lines */
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { S3Event } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { $set, UpdateItemCommand } from 'dynamodb-toolbox';
import { Resource } from 'sst';
import { z } from 'zod';

import { s3Client } from '~/clients';
import {
  ExamEntity,
  FormattedStatement,
  parseExamUploadedFileKey,
} from '~/libs';

export const handler = async (event: S3Event): Promise<void> => {
  await Promise.all(
    event.Records.map(async record => {
      const objectKey = record.s3.object.key;

      const match = parseExamUploadedFileKey(objectKey);

      if (match === undefined) {
        return;
      }

      const { examId, fileName, userId } = match;

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id: examId,
          userId,
          problems: {
            uploadFiles: {
              [fileName]: $set({
                status: 'uploaded',
                problem: undefined,
              }),
            },
          },
        })
        .send();

      const { Body: rawData } = await s3Client.send(
        new GetObjectCommand({
          Key: objectKey,
          Bucket: Resource['exam-bucket'].name,
        }),
      );

      if (rawData === undefined) {
        throw new Error();
      }

      const base64 = await rawData.transformToString('base64');

      const formatContext = `Tu dois me dire si l'image que je vais te fournir représente un et un seul exercice de mathématiques. Un exercice peut contenir plusieurs questions distinctes au premier abord, mais qui ont en fait du sens entre elles dans des questions ultérieures : ne pas les confondre avec des exercices distincts.`;

      const formatHumanMessage = new HumanMessage({
        content: [
          {
            type: 'text' as const,
            text: "Voici l'image :",
          },
          {
            type: 'image_url' as const,
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
          {
            type: 'text' as const,
            text: 'Dis-moi si cette image représente un exercice de mathématiques.',
          },
        ],
      });

      const formatChat = new ChatOpenAI({
        apiKey: Resource.OpenaiApiKey.value,
        temperature: 0,
        modelName: 'gpt-4o-mini',
        configuration: {
          project: Resource.OpenaiProjectId.value,
        },
        verbose: process.env.STAGE === 'local',
      }).withStructuredOutput(
        z.object({
          isOneProblem: z
            .boolean()
            .describe(
              "Vrai si l'image correspond à un exercice de mathématiques",
            ),
          explanantion: z
            .string()
            .describe(
              "Explication de pourquoi l'image n'est pas un exercice de mathématiques",
            ),
        }),
      );

      const formatPrompt = ChatPromptTemplate.fromMessages([
        ['system', formatContext],
        formatHumanMessage,
      ]);

      const formatChain = RunnableSequence.from([formatPrompt, formatChat]);

      const { isOneProblem } = await formatChain.invoke({});

      if (!isOneProblem) {
        await ExamEntity.build(UpdateItemCommand)
          .item({
            id: examId,
            userId,
            problems: {
              uploadFiles: {
                [fileName]: $set({
                  status: 'error',
                  problem: undefined,
                }),
              },
            },
          })
          .send();

        return;
      }

      const context = `Je vais te fournir un exercice (qui peut contenir une ou plusieurs questions) sous la forme d'une image. Ton objectif est de retranscrire fidèlement l'énoncé. Tu dois découper l'exercice en autant de questions ou texte introductif ou intermédiaire qu'il contient.

Important : L'utilisation du langage LaTeX (ou MathJax) doit systématiquement et impérativement inclure les délimiteurs suivants :
- Un seul symbole dollar '$' pour du rendu inline ;
- Deux symboles dollar '$$' pour du rendu en bloc.`;

      const humanProblemImageMessage = new HumanMessage({
        content: [
          {
            type: 'text' as const,
            text: "Voici l'image contenant un exercice :",
          },
          {
            type: 'image_url' as const,
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
          {
            type: 'text' as const,
            text: "Donne moi la transcription fidèle de l'énoncé, sans le titre éventuel.",
          },
        ],
      });

      const chat = new ChatOpenAI({
        apiKey: Resource.OpenaiApiKey.value,
        temperature: 0,
        modelName: 'gpt-4o',
        configuration: {
          project: Resource.OpenaiProjectId.value,
        },
        verbose: process.env.STAGE === 'local',
      }).withStructuredOutput(
        z.object({
          problem: z
            .object({
              content: z
                .object({
                  text: z
                    .string()
                    .describe(
                      "L'énoncé de la question ou le contenu du texte introductif ou intermédiaire, sans inclure les numéros de question. Le langage LaTeX doit être délimité avec un ou deux symboles dollar '$' !",
                    ),
                  type: z
                    .enum(['statement', 'question'])
                    .describe(
                      "Si le texte correspond à un texte introductif ou intermédiaire, ou s'il s'agit d'une question.",
                    ),
                  numberOfLines: z
                    .number()
                    .describe(
                      "Le nombre de lignes dont un élève qui écrit très gros a besoin pour répondre à la question de manière complète et strucurée, 0 si s'il s'agit d'un texte introductif ou intermédiaire",
                    ),
                })
                .strict()
                .array(),
            })
            .strict(),
        }),
      );

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', context],
        humanProblemImageMessage,
      ]);

      const chain = RunnableSequence.from([prompt, chat]);

      const { problem } = await chain.invoke({});

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id: examId,
          userId,
          problems: {
            uploadFiles: {
              [fileName]: $set({
                status: 'analyzed',
                problem: formatProblem(problem),
              }),
            },
          },
        })
        .send();
    }),
  );
};

type Statement = {
  type: 'statement' | 'question';
  text: string;
  numberOfLines: number;
};

type Problem = {
  content: {
    text: string;
    type: 'statement' | 'question';
    numberOfLines: number;
  }[];
};

type FormattedProblem = { content: FormattedStatement[]; id: string };

const formatStatement = (
  statement: Statement,
  index: number,
): FormattedStatement => {
  if (statement.type === 'statement') {
    return {
      text: statement.text,
      type: 'statement',
      id: randomUUID(),
    };
  }

  return {
    ...statement,
    type: 'question',
    id: randomUUID(),
    index,
  };
};
const formatProblem = (problem: Problem): FormattedProblem => {
  let questionIndex = 0;

  const formattedProblemContent = problem.content.reduce((acc, statement) => {
    if (statement.type === 'statement') {
      return [...acc, formatStatement(statement, questionIndex)];
    }

    questionIndex++;

    return [...acc, formatStatement(statement, questionIndex)];
  }, [] as FormattedStatement[]);

  return {
    content: formattedProblemContent,
    id: randomUUID(),
  };
};
