/* eslint-disable max-lines */
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { writeFileSync } from 'fs';
import { Config } from 'sst/node/config';
import { z } from 'zod';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { ChatMessageContent, validateExamOwnership } from '../libs';
import { getResponseImagesMessageContent } from '../libs/utils/chat/getResponseImagesMessageContent';
import { getSubjectAnalysisMessageContent } from '../libs/utils/chat/getSubjectAnalysisMessageContent';
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

      // const context = `Ton objectif est de corriger la copie de mathématiques d'un élève en seconde.
      // Tu dois renvoyer les noms et prénoms de l'élève si tu les trouves dans la copie, et pour toutes les questions de l'examen :
      // - La note de l'élève pour chaque question en fonction du barême fourni ;
      // - La correction ;
      // - La réponse de l'élève à la question ;
      // - L'uuid de la question ;

      // Tu dois transformer la réponse de l'élève pour que l'utilisation de LaTeX soit systématiquement délimitée par un seul symbole '$'.

      // Par exemple, si l'élève a écrit "I=]−∞;5]", alors tu dois renvoyer "$I = ] -\\infty ; 5 ]$"`;
      const context = `Tu es un professeur de mathématiques en seconde qui corrige la copie d'un élève. 

L'élève va te fournir le sujet de l'examen sous la forme d'images ou chaque image correspond à une page de l'examen, puis il va te fournir la copie qu'il a rendue aussi sous la forme d'images ou chaque image correspond à une page de sa copie. Enfin, il va te fournir une version de l'énoncé au format JSON dans laquelle tu trouveras les uuids qui te permettront d'identifier les questions de chaque exercice et leur note sur 20 points.

Tu dois renvoyer, pour chaque exercice et question de l'examen :
- Les noms et prénoms de l'élève qui a rendu la copie ;
- Un titre descriptif des notions abordées dans l'exercice ;
- L'index de l'exercice dans l'examen ;
- Pour chaque question de l'exercice :
  - Le chemin de la question dans l'exercice ;
  - L'énoncé de la question (tu utilises le langage LaTeX uniquement pour les formules mathématiques) ;
  - L'intégralité de la réponse de l'élève à la question  (tu utilises le langage LaTeX uniquement pour les formules mathématiques) ;
  - Les axes d'amélioration de l'élève ; 
  - La note de l'élève à la question ;

À chaque fois que tu utilises le langage LaTeX, tu utilises les délimiteurs suivants :
- Un seul symbole dollar '$' pour du rendu inline ;
- Deux symboles dollar '$$' pour du rendu en bloc.`;

      // Les réponses de l'élèves sont destinées à être rendues de manière digitale. Tu dois donc t'assurer que l'utilisation du LaTeX dans la retranscription des réponses est bien délimitée par un seul symbole '$'.

      // Pour retranscrire les réponses de l'élève, tu utilises le langage LaTeX, que tu délimites par un seul symbole dollar '$'.

      // Par exemple, si dans la copie tu trouves "x + y = 0" alors tu renvoies "$x + y = 0$".`;

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

      const examAnalysisMessages = await getSubjectAnalysisMessageContent({
        organizationId,
        userId,
        examId,
      });

      const task: ChatMessageContent = {
        type: 'text' as const,
        text: "Corrige ma copie s'il te plaît.",
      };

      const humanMessage = new HumanMessage({
        content: [
          ...subjectImagesMessages,
          ...responseImagesMessages,
          ...examAnalysisMessages,
          task,
        ],
      });

      const chat = new ChatOpenAI({
        apiKey: Config.OPENAI_API_KEY,
        temperature: 0,
        modelName: 'gpt-4o-mini',
        configuration: {
          project: Config.OPENAI_PROJECT_ID,
        },
        // verbose: process.env.STAGE === 'local',
      }).withStructuredOutput(
        z
          .object({
            name: z
              .string()
              .optional()
              .describe("Le nom de l'élève qui a rendu la copie"),
            answers: z.array(
              z.object({
                id: z
                  .string()
                  .describe("L'id de la question, sous forme d'uuid"),
                answer: z
                  .string()
                  .describe("La réponse de l'élève à la question"),
                mark: z
                  .number()
                  .min(0)
                  .describe("La note obtenue par l'élève à la question"),
                correction: z
                  .string()
                  .describe("La correction de la réponse de l'élève"),
              }),
            ),
          })
          .strict(),
      );

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', context],
        humanMessage,
      ]);

      const chain = RunnableSequence.from([prompt, chat]);

      const response = await chain.invoke({});

      writeFileSync(
        '/Users/pierremilliotte/Projects/corrector/response.json',
        JSON.stringify(response),
      );
    },
  );
