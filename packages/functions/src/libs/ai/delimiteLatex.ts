import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Resource } from 'sst';

import { ProblemOutput, problemOutputSchema } from '../types';

export const delimiteLatex = async (inputProblem: {
  problem: ProblemOutput;
}): Promise<ProblemOutput> => {
  const context = `Je vais te fournir un exercice de mathématiques sous la forme d'un objet JSON, ou l'énoncé et les questions se trouvent dans la clé "content". Tu dois utiliser autant que possible le langage LaTeX (ou KaTeX ou MathJax) délimité comme suit :
- Un seul symbole dollar '$' pour du rendu inline ;
- Deux symboles dollar '$$' pour du rendu en bloc.

Par exemple : 
- L'énoncé 'Soit l'expression suivante : \\( a^{{2}} + b^{{2}} = 2 \\)' doit être modifié en 'Soit l'expression suivante : $a^{{2}} + b^{{2}} = 2$'
- L'énoncé 'Soit l'expression suivante : C = \\frac{{4 \\times x}}{{2}}' doit être modifié en 'Soit l'expression suivante : $C = \\frac{{4 \\times x}}{{2}}$'
- L'énoncé 'On considère le point M de coordonnées : \\[ M(1; 2) \\]. M est-il l'origine ?' doit être modifié en 'On considère le point $M$ de coordonnées : $$M(1; 2)$$ $M$ est-il l'origine ?'

Dans chacun des exemples, les expressions mathématiques ont toutes été délimitées par un ou deux symboles dollar '$'.

Tous les nombres, variables ou expressions mathématiques doivent être contenus dans ces délimiteurs.

Ainsi tu dois modifier uniquement la forme du texte, pas le fond, et chaque expression LaTeX doit impérativement être délimitée.`;

  const humanProblemImageMessage = new HumanMessage({
    content: [
      {
        type: 'text' as const,
        text: 'Voici le problème au format JSON :',
      },
      {
        type: 'text' as const,
        text: JSON.stringify(inputProblem),
      },
      {
        type: 'text' as const,
        text: 'Délimite correctement toute utilisation du langage LaTeX.',
      },
    ],
  });

  const chat = new ChatOpenAI({
    apiKey: Resource.OpenaiApiKey.value,
    temperature: 0,
    modelName: 'gpt-4o-mini',
    configuration: {
      project: Resource.OpenaiProjectId.value,
    },
    verbose: Resource.App.stage === 'dev',
  }).withStructuredOutput(problemOutputSchema);

  const prompt = ChatPromptTemplate.fromMessages<{
    inputProblem: { problem: ProblemOutput };
  }>([['system', context], humanProblemImageMessage]);

  const chain = RunnableSequence.from([prompt, chat]);

  const { problem } = await chain.invoke({ inputProblem });

  return problem;
};
