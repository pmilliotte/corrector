/* eslint-disable max-lines */
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { writeFileSync } from 'fs';
import { Resource } from 'sst';
import { z } from 'zod';

import {
  ChatMessageContent,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

import { getResponseImagesMessageContent } from '../libs2/utils/chat/getResponseImagesMessageContent';
import { getSubjectAnalysisMessageContent } from '../libs2/utils/chat/getSubjectAnalysisMessageContent';
import { getSubjectImagesMessageContent } from '../libs2/utils/chat/getSubjectImagesMessageContent';

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
      // - La note de l'élève pour chaque question en fonction du barème fourni ;
      // - La correction ;
      // - La réponse de l'élève à la question ;
      // - L'uuid de la question ;

      // Tu dois transformer la réponse de l'élève pour que l'utilisation de LaTeX soit systématiquement délimitée par un seul symbole '$'.

      // Par exemple, si l'élève a écrit "I=]−∞;5]", alors tu dois renvoyer "$I = ] -\\infty ; 5 ]$"`;
      const context = `Tu es un professeur de mathématiques en quatrième qui corrige la copie d'un élève. 

L'élève va te fournir le sujet de l'examen sous la forme d'images ou chaque image correspond à une page de l'examen, puis il va te fournir la copie qu'il a rendue aussi sous la forme d'images ou chaque image correspond à une page de sa copie. Enfin, il va te fournir une version de l'énoncé au format JSON dans laquelle tu trouveras :
- Les uuids qui te permettront d'identifier les questions de chaque exercice ;
- Le barême de chaque question qui te permettra d'attribuer une note à l'élève ;
- Des instructions sur comment attribuer la totalité ou une partie des points de la question à l'élève.

Tu dois renvoyer les noms et prénoms de l'élève tels qu'ils apparaissent au début de la copie rendue, et pour chaque exercice et question de l'examen :
  - L'énoncé de la question (tu utilises le langage LaTeX uniquement pour les formules mathématiques) ;
  - L'intégralité de la réponse de l'élève à la question  (tu utilises le langage LaTeX uniquement pour les formules mathématiques), pas seulement la réponse finale ;
  - Les étapes du raisonnement attendu que l'élève n'a pas trouvées ;
  - Les axes d'amélioration de l'élève ; 
  - La note de l'élève à la question, déterminée grâce aux instructions fournies ;
  - L'indice de confiance de la retranscription de l'élève : si tu es certain de reconnaître ce que l'élève a écrit, renvoie 100, si l'élève a écrit des ratures illisibles, renvoie 0 ;

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
        apiKey: Resource.OpenaiApiKey.value,
        temperature: 0,
        modelName: 'gpt-4o-mini',
        configuration: {
          project: Resource.OpenaiProjectId.value,
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
                problemId: z
                  .string()
                  .describe("L'id de l'exercice, sous forme d'uuid"),
                questionId: z
                  .string()
                  .describe("L'id de la question, sous forme d'uuid"),
                answerConfidence: z
                  .number()
                  .min(0)
                  .max(100)
                  .describe(
                    "L'indice de confiance de la retranscription de l'élève : si tu es certain de reconnaître ce que l'élève a écrit, renvoie 100, si l'élève a écrit des ratures illisibles, renvoie 0",
                  ),
                answer: z
                  .string()
                  .describe("La réponse de l'élève à la question"),
                mark: z
                  .number()
                  .min(0)
                  .describe("La note obtenue par l'élève à la question"),
                markExplanation: z
                  .string()
                  .describe("L'explication du détail de la note"),
                wrongMethodSteps: z
                  .string()
                  .describe(
                    "Une étape du raisonnement que l'élève n'a pas trouvées.",
                  )
                  .array()
                  .optional()
                  .describe(
                    "Si l'élève n'a pas répondu parfaitement à la question, les étapes du raisonnement que l'élève n'a pas trouvées.",
                  ),
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
        JSON.stringify({
          ...response,
          mark: response.answers.reduce((a, b) => a + b.mark, 0),
        }),
      );
    },
  );
