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
  const context = `Je vais te fournir un exercice de mathématiques (qui peut contenir une ou plusieurs questions ou énoncés introductifs) sous la forme d'une image. Ton objectif est de retranscrire fidèlement l'intégralité de l'énoncé. Tu dois découper l'exercice en autant de questions ou texte introductif ou intermédiaire qu'il contient.

Important : Tous les nombres, variables ou expressions mathématiques doivent être exprimés en langage LaTeX (ou KaTeX ou MathJax) valide et délimités comme suit :
- Un seul symbole dollar '$' pour du rendu inline ;
- Deux symboles dollar '$$' pour du rendu en bloc.

Par exemple : 
- une expression mathématique de la forme "A = ..." doit systématiquement être délimitée : "$A = \\ldots$" ;
- une suite de nombres de la forme "17 + 5" même sans symbole LaTeX, doit systématiquement être délimitée : "$17 + 5$" ;
- une expression mathématique avec des nombres, même sans symbole LaTeX, de la forme "B = (+48,5) + (-8) - 5" doit systématiquement être délimitée : "$B = (+48,5) + (-8) - 5$" ;
- une expression mathématique avec des nombres, avec des symboles LaTeX, de la forme "B = 6 \\div (5-3) + 2 \\times 2" doit systématiquement être délimitée : "$B = 6 \\div (5-3) + 2 \\times 2$" ;
- les symboles texte comme "€" à l'intérieur des délimiteurs "$" doivent être exprimés comme : "\\text{{€}}". Donc "920 €" doit être délimité comme suit : "$920 \\text{{€}}$ ;

Pour chaque question tu dois aussi renvoyer le nombre de lignes nécessaires à un élève qui écrit gros pour répondre de manière détaillée.

Voici des exemples de ce que tu dois renvoyer ("good examples") versus ce que tu ne dois jamais renvoyer ("bad examples") :
<output_examples>
  <output_example index="1">
    <good_example>
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
    </good_example>
    <bad_example>
      {{
        problem: {{
          content: [
            {{
              text: 'Calculer x pour chacune des expressions suivantes :',
              type: 'statement',
            }},
            {{
              text: 'x^{{2}} = 1',
              type: 'question',
              numberOfLines: 1
            }},
            {{
              text: '4x^{{2}} + 2 \\times x = 4',
              type: 'question',
              numberOfLines: 2
            }},
          ]
        }}
      }} 
    </bad_example>
  </output_example>
  <output_example index="2">
    <good_example>
      {{
        problem: {{
          content: [
            {{
              "type": "statement",
              "text": "Calculer les expression numériques suivantes :",
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
              "type": "question",
              "text": "$B = 6 \\div (5 - 3) + 8 + 2 \\times 2 =$",
              "numberOfLines": 3,
            }},
          ]
        }}
      }} 
    </good_example>
    <bad_example>
      {{
        problem: {{
          content: [
            {{
              "type": "statement",
              "text": "Calculer les expression numériques suivantes :",
            }},
            {{
              "type": "question",
              "text": "A = 12 + [3 \\times [5 + (4 \\times 7) + 2]] + (8 \\times 3)",
              "numberOfLines": 3,
            }},
            {{
              "type": "question",
              "text": "B = 25 - [12 - (3 + 4)]",
              "numberOfLines": 3,
            }},
            {{
              "type": "question",
              "text": "B = 6 \\div (5 - 3) + 8 + 2 \\times 2 =",
              "numberOfLines": 3,
            }},
          ]
        }}
      }} 
    </bad_example>
  </output_example>
  <output_example index="3">
    <good_example>
      {{
        problem: {{
          content: [
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
    </good_example>
    <bad_example>
      {{
        problem: {{
          content: [
            {{
              "type": "statement",
              "text": "Résoudre, dans l'ensemble des nombres relatifs, les équations suivantes :",
            }},
            {{
              "type": "question",
              "text": "(x - 1)(x + 3) = (x + 4)(x + 3)",
              "numberOfLines": 4,
            }},
            {{
              "type": "question",
              "text": "8x - 2(3x + 4) = 2x - 2",
              "numberOfLines": 4,
            }},
          ]
        }}
      }} 
    </bad_example>
  </output_example>
  <output_example index="4">
    <good_example>
      {{
        problem: {{
          content: [
            {{
              "type": "question",
              "text": "$A = \\frac{{-1}}{{2}} \\times \\frac{{-3}}{{4}} \\times \\frac{{5}}{{6}} \\times \\frac{{7}}{{-10}}$",
              "numberOfLines": 4,
            }},
          ]
        }}
      }} 
    </good_example>
    <bad_example>
      {{
        problem: {{
          content: [
            {{
              "type": "question",
              "text": "A = \\frac{{-1}}{{2}} \\times \\frac{{-3}}{{4}} \\times \\frac{{5}}{{6}} \\times \\frac{{7}}{{-10}}",
              "numberOfLines": 4,
            }},
          ]
        }}
      }} 
    </bad_example>
  </output_example>
  <output_example index="5">
    <good_example>
      {{
        problem: {{
          content: [
            {{
                "type": "statement",
                "text": "Déterminer la valeur des expressions suivantes :",
            }},
            {{
                "type": "question",
                "text": "$A = (+27) - (+53) + (-2,9) - (+13,7)$",
                "numberOfLines": 2,
            }},
            {{
                "type": "question",
                "text": "$B = (-25) - (-47) - (-17,7) - (+3,4)$",
                "numberOfLines": 2,
            }},
          ]
        }}
      }} 
    </good_example>
    <bad_example>
      {{
        problem: {{
          content: [
            {{
                "type": "statement",
                "text": "Déterminer la valeur des expressions suivantes :",
            }},
            {{
                "type": "question",
                "text": "A = (+27) - (+53) + (-2,9) - (+13,7)",
                "numberOfLines": 2,
            }},
            {{
                "type": "question",
                "text": "B = (-25) - (-47) - (-17,7) - (+3,4)",
                "numberOfLines": 2,
            }},
          ]
        }}
      }} 
    </bad_example>
  </output_example>
</output_examples>`;

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
