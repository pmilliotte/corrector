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
import { ExamEntity, parseExamUploadedFileKey } from '~/libs';

export const handler = async (event: S3Event): Promise<void> => {
  await Promise.all(
    event.Records.map(async record => {
      const objectKey = record.s3.object.key;

      const match = parseExamUploadedFileKey(objectKey);

      if (match === undefined) {
        return;
      }

      const { examId, fileName, userId } = match;

      const context = `Ton objectif est de retranscrire fidèlement les énoncés des problèmes que je vais te fournir sous forme d'une image. Tu dois découper chaque problème en autant de questions ou texte introductif ou intermédiaire qu'il contient.

Important : Toute utilisation du langage LaTeX doit systématiquement être délimitée par les délimiteurs suivants :
- Un seul symbole dollar '$' pour du rendu inline ;
- Deux symboles dollar '$$' pour du rendu en bloc.`;

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

      const humanProblemImageMessage = new HumanMessage({
        content: [
          {
            type: 'text' as const,
            text: "Voici l'image contenant un ou plusieurs exercices :",
          },
          {
            type: 'image_url' as const,
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
          {
            type: 'text' as const,
            text: 'Donne moi la transcription fidèle des énoncés.',
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
          problems: z
            .object({
              content: z
                .object({
                  text: z
                    .string()
                    .describe(
                      "L'énoncé de la question ou le contenu du texte introductif ou intermédiaire, sans inclure les numéros de question.",
                    ),
                  type: z
                    .enum(['statement', 'question'])
                    .describe(
                      "Si le texte correspond à un texte introductif ou intermédiaire, ou s'il s'agit d'une question.",
                    ),
                })
                .strict()
                .array(),
            })
            .strict()
            .array(),
        }),
      );

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', context],
        humanProblemImageMessage,
      ]);

      const chain = RunnableSequence.from([prompt, chat]);

      const { problems } = await chain.invoke({});

      const formattedProblems = problems.map(problem => ({
        content: problem.content.reduce(
          (acc, item) => {
            if (item.type === 'statement') {
              return {
                ...acc,
                items: [
                  ...acc.items,
                  {
                    type: 'statement' as const,
                    text: item.text,
                    id: randomUUID(),
                  },
                ],
              };
            }

            return {
              lastQuestion: acc.lastQuestion + 1,
              items: [
                ...acc.items,
                {
                  type: 'question' as const,
                  text: item.text,
                  index: acc.lastQuestion + 1,
                  id: randomUUID(),
                },
              ],
            };
          },
          {
            lastQuestion: 0,
            items: [] as (
              | { text: string; type: 'statement'; id: string }
              | { text: string; type: 'question'; index: number; id: string }
            )[],
          },
        ).items,
        id: randomUUID(),
      }));

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id: examId,
          userId,
          problems: {
            [fileName]: $set(formattedProblems),
          },
        })
        .send();
    }),
  );
};
