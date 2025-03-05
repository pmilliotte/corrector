import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Resource } from 'sst';
import { z } from 'zod';

export const hasOneProblemOnly = async (
  imageAsBase64: string,
): Promise<boolean> => {
  const formatContext = `Tu dois me dire si l'image que je vais te fournir représente un et un seul exercice de mathématiques. Un exercice peut contenir plusieurs questions distinctes au premier abord, mais qui ont en fait du sens entre elles dans des questions ultérieures : ne pas les confondre avec des exercices distincts.`;

  const formatHumanMessage = new HumanMessage({
    content: [
      {
        type: 'text' as const,
        text: "Voici l'image :",
      },
      {
        type: 'image_url' as const,
        image_url: {
          url: `data:image/jpeg;base64,${imageAsBase64}`,
        },
      },
      {
        type: 'text' as const,
        text: 'Dis-moi si cette image représente un exercice de mathématiques.',
      },
    ],
  });

  const formatChat = new ChatOpenAI({
    apiKey: Resource.OpenaiApiKey.value,
    temperature: 0,
    modelName: 'gpt-4o-mini',
    configuration: {
      project: Resource.OpenaiProjectId.value,
    },
    // verbose: Resource.App.stage === 'dev',
    verbose: false,
  }).withStructuredOutput(
    z.object({
      isOneProblem: z
        .boolean()
        .describe("Vrai si l'image correspond à un exercice de mathématiques"),
      explanantion: z
        .string()
        .describe(
          "Explication de pourquoi l'image n'est pas un exercice de mathématiques",
        ),
    }),
  );

  const formatPrompt = ChatPromptTemplate.fromMessages([
    ['system', formatContext],
    formatHumanMessage,
  ]);

  const formatChain = RunnableSequence.from([formatPrompt, formatChat]);

  const { isOneProblem } = await formatChain.invoke({});

  return isOneProblem;
};
