/* eslint-disable max-lines */
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Resource } from 'sst';

import { ProblemOutput, problemOutputSchema } from '../types';

export const getProblem = async (
  imageAsBase64: string,
): Promise<ProblemOutput> => {
  const context = `Objectif : L'utilisateur te donne un exercice de mathématiques sous la forme d'une image. Tu dois retranscrire fidèlement l'intégralité de l'énoncé.

Règles :
1. Tu dois découper l'exercice en autant de questions ou texte introductif ou intermédiaire qu'il contient.
2. Tous les nombres, variables ou expressions mathématiques que tu extrais de l'énoncé doivent être exprimés en langage LaTeX (ou KaTeX ou MathJax) valide et impérativement délimités avec des symboles dollars $ :
  - Un seul symbole dollar '$' pour du rendu inline ;
  - Deux symboles dollar '$$' pour du rendu en bloc.
3. Pour chaque question tu dois aussi renvoyer le nombre de lignes nécessaires à un élève qui écrit gros pour répondre de manière détaillée.

La règle 2 est très importante. Par exemple :
- une expression mathématique de la forme "A = ..." ne doit jamais apparaître dans ta réponse sans délimiteurs "$" : "$A = \\ldots$" ;
- une suite de nombres de la forme "17 + 5" même sans symbole LaTeX, ne doit jamais apparaître dans ta réponse sans délimiteurs "$" : "$17 + 5$" ;
- une expression mathématique avec des nombres, même sans symbole LaTeX, ne doit jamais apparaître dans ta réponse sans délimiteurs "$" : "$B = (+48,5) + (-8) - 5$" ;
- une expression mathématique avec des nombres, avec des symboles LaTeX, ne doit jamais apparaître dans ta réponse sans délimiteurs "$" : "$B = 6 \\div (5-3) + 2 \\times 2$" ;
- les symboles texte comme "€" à l'intérieur des délimiteurs "$" doivent être exprimés comme : "\\text{{€}}". Donc "920 €" doit être délimité comme suit : "$920 \\text{{€}}$" ;

Par exemple, dans l'output possible suivant, toutes les expressions mathématiques des clefs "text" sont délimitées par un symbole dollar :
"""
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
        numberOfLines: 2
      }},
      {{
        text: '$4x^{{2}} + 2 \\times x = 4$',
        type: 'question',
        numberOfLines: 2
      }}
      {{
        text: 'Calculer les expressions suivantes :',
        type: 'statement',
      }},
      {{
        text: '$A = 9 + 2 \\times 6 =$',
        type: 'question',
        numberOfLines: 3
      }},
      {{
        text: '$B = 6 \\div (5 - 3) + 8 + 2 \\times 2 =$',
        type: 'question',
        numberOfLines: 3
      }},
      {{
        "type": "question",
        "text": "$A = 12 + [3 \\times [5 + (4 \\times 7) + 2]] + (8 \\times 3)$",
        "numberOfLines": 3,
      }},
      {{
        "type": "question",
        "text": "$B = 25 - [12 - (3 + 4)]$",
        "numberOfLines": 3,
      }},
                  {{
        "type": "statement",
        "text": "Résoudre, dans l'ensemble des nombres relatifs, les équations suivantes :",
      }},
      {{
        "type": "question",
        "text": "$(x - 1)(x + 3) = (x + 4)(x + 3)$",
        "numberOfLines": 4,
      }},
      {{
        "type": "question",
        "text": "$8x - 2(3x + 4) = 2x - 2$",
        "numberOfLines": 4,
      }},
    ]
  }}
}} 
"""`;

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
        text: "Donne moi la transcription fidèle de l'énoncé, sans le titre éventuel, en délimitant par des symboles dollars toutes les variables, nombres et expressions mathématiques.",
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
    verbose: Resource.App.stage === 'dev',
  }).withStructuredOutput(problemOutputSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', context],
    humanProblemImageMessage,
  ]);

  const chain = RunnableSequence.from([prompt, chat]);

  const { problem } = await chain.invoke({});

  return problem;
};
