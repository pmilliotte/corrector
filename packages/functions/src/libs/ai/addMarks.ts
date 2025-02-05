import { HumanMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Resource } from 'sst';

import { FormattedStatementWithMarks } from '@corrector/shared';

import { FormattedStatement } from '../types';

export const addMarks = async (
  problems: { content: FormattedStatement[]; id: string }[],
): Promise<{ content: FormattedStatementWithMarks[]; id: string }[]> => {
  const context = `Je vais t'envoyer un examen de mathématiques sous la forme d'exercices ou chaque exercice contient une ou plusieurs questions. 
  
  Ton objectif est de me proposer un barême sur 20 points. 
  
  Les notes de chaque question doivent dépendre de la difficulté, et peuvent être des nombres entiers ou des demis : par exemple 1, 2, 3, 4 etc... pour les entiers et 0.5, 1.5, 2.5, 3.5 etc... pour les demis.
  
  Il est important qu'à la fin, la somme des notes de toutes les questions vale 20.
  
  Tu dois répondre uniquement avec un JSON valide de la forme :
  {{ questionMarks: [{{ questionId: "string", mark: "number" }}] }}`;

  const humanProblemsMarksMessage = new HumanMessage({
    content: [
      {
        type: 'text' as const,
        text: context,
      },
      {
        type: 'text' as const,
        text: "Voici l'examen sous la forme d'exercices, ou chaque exercice comporte des questions :",
      },
      {
        type: 'text' as const,
        text: JSON.stringify({ problems }),
      },
      {
        type: 'text' as const,
        text: 'Vérifie bien que la somme des notes de toutes les questions de tous les problèmes vaut 20.',
      },
    ],
  });

  const chat = new ChatOpenAI({
    apiKey: Resource.OpenaiApiKey.value,
    model: 'o1-mini',
    configuration: {
      project: Resource.OpenaiProjectId.value,
    },
    verbose: process.env.STAGE === 'local',
  });

  const prompt = ChatPromptTemplate.fromMessages([humanProblemsMarksMessage]);

  type Marks = { questionMarks: { questionId: string; mark: number }[] };
  const parser = new JsonOutputParser<Marks>();

  const chain = RunnableSequence.from([prompt, chat]).pipe(parser);

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
