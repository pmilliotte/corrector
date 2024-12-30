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

      // const context = `Ton objectif est de corriger la copie de mathématiques d'un élève en seconde.
      // Tu dois renvoyer les noms et prénoms de l'élève si tu les trouves dans la copie, et pour toutes les questions de l'examen :
      // - La note de l'élève pour chaque question en fonction du barème fourni ;
      // - La correction ;
      // - La réponse de l'élève à la question ;
      // - L'uuid de la question ;

      // Tu dois transformer la réponse de l'élève pour que l'utilisation de LaTeX soit systématiquement délimitée par un seul symbole '$'.

      // Par exemple, si l'élève a écrit "I=]−∞;5]", alors tu dois renvoyer "$I = ] -\\infty ; 5 ]$"`;
      const context = `Ton objectif est de retranscrire fidèlement l'écriture manuscrite d'un élève en quatrième. Il va te fournir :
- le sujet d'un examen de mathématiques tel qu'il lui a été distribué ;
- la copie qu'il a rendue avec ses réponses manuscrites ;

Tu dois lui renvoyer, pour chaque question :
<ItemsToRespond>
  <ItemToRespond index="1">
    La retranscription totale et fidèle de l'intégralité de sa réponse (en incluant son raisonnement) à la question.
  </ItemToRespond>
  <ItemToRespond index="2">
    Une note sur 10 de la lisibilité de sa réponse.
  </ItemToRespond>
</ItemsToRespond>`;
      //       const context = `Tu es un OCR ( optical character recognition). Ton objectif est de retranscrire de manière fidèle et exacte l'intégralité des réponses manuscrites d'un élève de quatrième à un examen de mathématiques.

      // L'élève va te fournir les documents suivants :
      // - Le sujet (sans les réponses) de l'examen sous la forme d'images ou chaque image correspond à une page de l'examen ;
      // - La copie qu'il a rendue sous la forme d'images ou chaque image correspond à une page de sa copie ;

      // À chaque fois que tu utilises le langage LaTeX pour la retranscription, tu utilises les délimiteurs suivants :
      // - Un seul symbole dollar '$' pour du rendu inline ;
      // - Deux symboles dollar '$$' pour du rendu en bloc.`;

      // Tu dois lui renvoyer, pour chaque exercice et chaque question :
      // <ItemsToRespond>
      //   <ItemToRespond index="1">
      //     La retranscription fidèle de la question.
      //   </ItemToRespond>
      //   <ItemToRespond index="2">
      //     La retranscription totale, fidèle et exacte de sa réponse à la question.
      //   </ItemToRespond>
      //   <ItemToRespond index="3">
      //     Une note sévère sur la clarté d'écriture sur 10 avec une explication.
      //   </ItemToRespond>
      // </ItemsToRespond>

      // <ItemToRespondAdditionalInstructions index="1">
      // Fidèle et exacte : tu ne dois pas ajouter, supprimer ou modifier des caractères, même si la logique de l'élève est fausse.
      // </ItemToRespondAdditionalInstructions>
      // <ItemToRespondAdditionalInstructions index="2">
      // Totale : tu dois renvoyer tout ce que l'élève a écrit, y compris le raisonnement intermédiaire et la réponse finale.
      // </ItemToRespondAdditionalInstructions>

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

      // const examAnalysisMessages = await getSubjectAnalysisMessageContent({
      //   organizationId,
      //   userId,
      //   examId,
      // });

      const assistantSubjectMessage = new AIMessage({
        content: "Donne moi le sujet de l'examen",
      });

      const subjectHumanMessage = new HumanMessage({
        content: subjectImagesMessages,
      });

      const assistantResponsesMessage = new AIMessage({
        content: "Donne moi tes réponses à l'examen",
      });

      const responsesHumanMessage = new HumanMessage({
        content: responseImagesMessages,
      });
      const task = new HumanMessage({
        content: `Peux-tu me renvoyer, pour chaque question de l'examen :

- L'intégralité de ma réponse : la transcription doit être fidèle à ce que j'ai écrit ;
- une note sévère de lisibilité : si tu hésites dans la retranscription d'un caractère, la note ne doit pas dépasser 5/10 ;`,
      });

      const chat = new ChatOpenAI({
        apiKey: Config.OPENAI_API_KEY,
        temperature: 0,
        modelName: 'gpt-4o',
        configuration: {
          project: Config.OPENAI_PROJECT_ID,
        },
        verbose: process.env.STAGE === 'local',
      }).withStructuredOutput(
        z.object({
          problems: z
            .object({
              path: z.number().describe("L'index de l'exercice dans l'examen"),
              answers: z
                .object({
                  statement: z
                    .string()
                    .describe(
                      "L'énoncé de la question, avec les symboles LaTeX",
                    ),
                  answer: z
                    .string()
                    .describe(
                      "L'intégralité de ce qu'a écrit l'élève avec des symboles LaTeX",
                    )
                    .optional(),
                  mark: z.string().describe('La note de lisibilité'),
                })
                .strict()
                .array()
                .describe(
                  "Les réponses aux questions de l'exercice, ou un élément correspond à une question",
                ),
            })
            .strict()
            .array()
            .describe("Les exercices de l'examen"),
        }),
      );

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
        JSON.stringify(response),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        // JSON.stringify({ resp: response.lc_kwargs.content }),
      );
    },
  );
