/* eslint-disable max-lines */
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { writeFileSync } from 'fs';
import { Config } from 'sst/node/config';
import { z } from 'zod';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { validateExamOwnership } from '../libs';
import { getResponseImagesMessageContent } from '../libs/utils/chat/getResponseImagesMessageContent';
import { getSubjectImagesMessageContent } from '../libs/utils/chat/getSubjectImagesMessageContent';

export const examResponseAnalyze = authedProcedure
  .input(
    z.object({
      responseId: z.string(),
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { responseId, examId, organizationId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId, organizationId }, session);

      const { id: userId } = session;

      const context = `Tu joues le rôle d'OCR. Tu dois retranscrire de manière fidèle et exacte l'intégralité des réponses manuscrites d'un élève de quatrième à un examen de mathématiques.
      
Pour ça, je vais te fournir :
- le sujet de l'examen tel qu'il a été distribué, cela t'aidera à déterminer ce qui a été ajouté par l'élève dans sa copie ;
- la copie d'un élève avec ses réponses manuscrites ;

Pour chaque question de l'examen, tu dois me retourner l'intégralité de ce que l'élève a répondu, le plus fidèlement possible. Chaque caractère manuscrit doit figurer dans ta réponse.

À chaque fois que tu fais apparaître le langage LaTeX, tu utilises les délimiteurs suivants :
- Un seul symbole dollar '$' pour du rendu inline ;
- Deux symboles dollar '$$' pour du rendu en bloc.`;

      const subjectImagesMessages = await getSubjectImagesMessageContent({
        organizationId,
        userId,
        examId,
      });

      const responseImagesMessages = await getResponseImagesMessageContent({
        organizationId,
        userId,
        examId,
        fileId: responseId,
      });

      const assistantSubjectMessage = new AIMessage({
        content: "Donne moi le sujet de l'examen.",
      });

      const subjectHumanMessage = new HumanMessage({
        content: subjectImagesMessages,
      });

      const assistantResponsesMessage = new AIMessage({
        content: "Donne moi la copie qu'a rendue l'élève.",
      });

      const responsesHumanMessage = new HumanMessage({
        content: responseImagesMessages,
      });
      const task = new AIMessage({
        content: `Voici, pour toutes les questions de l'examen, les réponses fidèles de l'élève, dans leur intégralité et non modifiées :`,
      });

      const chat = new ChatOpenAI({
        apiKey: Config.OPENAI_API_KEY,
        temperature: 0,
        modelName: 'gpt-4o',
        configuration: {
          project: Config.OPENAI_PROJECT_ID,
        },
        verbose: process.env.STAGE === 'local',
      });
      // .withStructuredOutput(
      //   z.object({
      //     problems: z
      //       .object({
      //         path: z.number().describe("L'index de l'exercice dans l'examen"),
      //         answers: z
      //           .object({
      //             statement: z
      //               .string()
      //               .describe(
      //                 "L'énoncé de la question, avec les symboles LaTeX",
      //               ),
      //             answer: z
      //               .string()
      //               .describe(
      //                 "L'intégralité de ce qu'a écrit l'élève avec des symboles LaTeX",
      //               )
      //               .optional(),
      //             mark: z.string().describe('La note de lisibilité'),
      //           })
      //           .strict()
      //           .array()
      //           .describe(
      //             "Les réponses aux questions de l'exercice, ou un élément correspond à une question",
      //           ),
      //       })
      //       .strict()
      //       .array()
      //       .describe("Les exercices de l'examen"),
      //   }),
      // );

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', context],
        assistantSubjectMessage,
        subjectHumanMessage,
        assistantResponsesMessage,
        responsesHumanMessage,
        task,
      ]);

      const chain = RunnableSequence.from([prompt, chat]);

      const response = await chain.invoke({});

      writeFileSync(
        '/Users/pierremilliotte/Projects/corrector/response.json',
        // JSON.stringify(response),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        JSON.stringify({ resp: response.lc_kwargs.content }),
      );
    },
  );
