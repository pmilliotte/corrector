import { HumanMessage, MessageContentComplex } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Resource } from 'sst';
import { z } from 'zod';

const splitAnswersSchema = z.object({
  answerPagesByStudent: z.record(z.string(), z.number().array()),
});

export const splitAnswers = async ({
  imagesAsBase64,
  classroomStudents,
}: {
  imagesAsBase64: string[];
  classroomStudents: { firstName: string; lastName: string; uuid: string }[];
}): Promise<Record<string, number[]>> => {
  const context = `Je vais te fournir les informations suivantes :

- Les copies scannées des élèves de quatrième à un examen de mathématiques, potentiellement dans le désordre ;
- Les noms et identifiants (uuid) des élèves de la classe ;

Ton objectif est de me renvoyer, pour tous les identifiants des élèves de la classe qui ont rendu une copie, en fonction des noms et prénoms qui figurent en haut à droite de chaque page, les numéros des images qui leur appartiennent dans l'ordre des pages du sujet. 

Par exemple, pour l'input de trois élèves suivant : si le sujet de l'examen comporte 3 pages et que les images correspondant aux copies scannées sont envoyées comme tel :
<studentsInput>
[
  {{
    "firstName": "Léon",
    "lastName": "Marchand",
    "uuid": "a7ab6a22-3df9-4310-b26b-efe5b96e5905",
  }},
  {{
    "firstName": "Zinedine",
    "lastName": "Zidane",
    "uuid": "b1ff3d90-ff84-4160-b520-1b2aae3a9d8f",
  }},
  {{
    "firstName": "Marie-José",
    "lastName": "Pérec",
    "uuid": "4de926a7-bcb1-4d51-82bf-23a8db17c091",
  }}
]
</studentsInput>

Et pour l'input des copies scannées suivant :
<studentsAnswerPages>
- image numéro 1 : page 2/3 de Léon Marchand ;
- image numéro 2 : page 1/3 de Marie-José Pérec ;
- image numéro 3 : page 3/3 de Marie-José Pérec ;
- image numéro 4 : page 1/3 de Léon Marchand ;
- image numéro 5 : page 2/3 de Marie-José Pérec ;
</studentsAnswerPages>

Alors tu dois me renvoyer :
<expectedOutput>
{{
  "a7ab6a22-3df9-4310-b26b-efe5b96e5905": [4, 1],
  "a7ab6a22-3df9-4310-b26b-efe5b96e5905": [2, 5, 3]
}}
</expectedOutput>`;

  const humanSplitAnswersMessage = new HumanMessage({
    content: [
      {
        type: 'text',
        text: `Voici les élèves de la classe :`,
      },
      {
        type: 'text',
        text: JSON.stringify(classroomStudents),
      },
      {
        type: 'text',
        text: `Et voici les copies des élèves sous la forme d'images, ou une image correspond à une page scannée :`,
      },
      ...imagesAsBase64.reduce(
        (acc, imageAsBase64, index) => [
          ...acc,
          {
            type: 'text',
            text: `Voici l'image numéro : ${index + 1}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageAsBase64}`,
            },
          },
        ],
        [] as MessageContentComplex[],
      ),
    ],
  });

  const chat = new ChatOpenAI({
    apiKey: Resource.OpenaiApiKey.value,
    temperature: 0,
    modelName: 'gpt-4o-mini',
    configuration: {
      project: Resource.OpenaiProjectId.value,
    },
    verbose: process.env.STAGE === 'local',
  }).withStructuredOutput(splitAnswersSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', context],
    humanSplitAnswersMessage,
  ]);

  const chain = RunnableSequence.from([prompt, chat]);

  const { answerPagesByStudent } = await chain.invoke({});

  return answerPagesByStudent;
};
