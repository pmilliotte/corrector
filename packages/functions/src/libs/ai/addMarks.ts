import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Resource } from 'sst';
import { z } from 'zod';

import { FormattedStatementWithMarks } from '@corrector/shared';

import { FormattedStatement } from '../types';

export const addMarks = async (
  problems: { content: FormattedStatement[]; id: string }[],
): Promise<{ content: FormattedStatementWithMarks[]; id: string }[]> => {
  const context = `Ton objectif est de me proposer un barême sur 20 points pour l'examen que je vais te fournir.`;

  const humanProblemsMarksMessage = new HumanMessage({
    content: [
      {
        type: 'text' as const,
        text: "Voici l'examen sous la forme d'exercices, ou chaque exercice comporte des questions :",
      },
      {
        type: 'text' as const,
        text: JSON.stringify({ problems }),
      },
    ],
  });

  console.log('before chat');

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
      questionMarks: z
        .object({
          questionId: z.string(),
          mark: z.number().min(0).max(20),
        })
        .strict()
        .array(),
    }),
  );

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', context],
    humanProblemsMarksMessage,
  ]);

  const chain = RunnableSequence.from([prompt, chat]);

  const { questionMarks } = await chain.invoke({});

  return problems.map(({ content, id }) => ({
    id,
    content: content.map(statement => {
      if (statement.type === 'statement') {
        return statement;
      }

      return {
        ...statement,
        mark:
          questionMarks.find(({ questionId }) => questionId === statement.id)
            ?.mark ?? 0,
      };
    }),
  }));
};
