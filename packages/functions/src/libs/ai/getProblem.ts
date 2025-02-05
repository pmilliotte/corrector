import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Resource } from 'sst';

import { ProblemOutput, problemOutputSchema } from '../types';

export const getProblem = async (
  imageAsBase64: string,
): Promise<ProblemOutput> => {
  const context = `Je vais te fournir un exercice de mathématiques (qui peut contenir une ou plusieurs questions ou énoncés introductifs) sous la forme d'une image. Ton objectif est de retranscrire fidèlement l'intégralité de l'énoncé. Tu dois découper l'exercice en autant de questions ou texte introductif ou intermédiaire qu'il contient.

Un exemple d'output est le suivant :
<output>
{{
  problem: {{
    content: [
      {{
        text: 'Calculer $x$ pour chacune des expressions suivantes :',
        type: 'statement',
      }},
      {{
        text: '$x^{{2}} = 1$',
        type: 'question',
        numberOfLines: 1
      }},
      {{
        text: '$4x^{{2}} + 2 \\times x = 4$',
        type: 'question',
        numberOfLines: 2
      }},
    ]
  }}
}} 
</output>

Important : Tous les nombres, variables ou expressions mathématiques doivent être exprimés en langage LaTeX (ou KaTeX ou MathJax) valide et délimités comme suit :
- Un seul symbole dollar '$' pour du rendu inline ;
- Deux symboles dollar '$$' pour du rendu en bloc.

Par exemple : 
- une expression mathématique de la forme "A = ..." doit systématiquement être délimitée : "$A = \\ldots$" ;
- une suite de nombres de la forme "17 + 5" même sans symbole LaTeX, doit systématiquement être délimitée : "$17 + 5$" ;
- une expression mathématique avec des nombres, même sans symbole LaTeX, de la forme "B = 48,5 + (-8)" doit systématiquement être délimitée : "$B = 48,5 + (-8)$" ;
- les symboles texte comme "€" à l'intérieur des délimiteurs "$" doivent être exprimés comme : "\\text{{€}}". Donc "920 €" doit être délimité comme suit : "$920 \\text{{€}}$ ;

Pour chaque question tu dois aussi renvoyer le nombre de lignes nécessaires à un élève qui écrit gros pour répondre de manière détaillée.`;

  const humanProblemImageMessage = new HumanMessage({
    content: [
      {
        type: 'text' as const,
        text: "Voici l'image contenant un exercice :",
      },
      {
        type: 'image_url' as const,
        image_url: {
          url: `data:image/jpeg;base64,${imageAsBase64}`,
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
  }).withStructuredOutput(problemOutputSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', context],
    humanProblemImageMessage,
  ]);

  const chain = RunnableSequence.from([prompt, chat]);

  const { problem } = await chain.invoke({});

  return problem;
};
