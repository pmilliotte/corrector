import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Config } from 'sst/node/config';

import { Division, getResponseOutputSchema, Subject } from '@corrector/shared';

import { ChatMessageContent } from '../../types';
import { translations } from '../i18n';
import { getResponseImagesMessageContent } from './getResponseImagesMessageContent';
import { getSubjectAnalysisMessageContent } from './getSubjectAnalysisMessageContent';
import { getSubjectImagesMessageContent } from './getSubjectImagesMessageContent';

export const getResponseAnalysisChain = async ({
  division,
  subject,
  organizationId,
  userId,
  examId,
  fileId,
}: {
  division: Division;
  subject: Subject;
  organizationId: string;
  userId: string;
  examId: string;
  fileId: string;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}) => {
  const context = translations.__('responseAnalysis.context', {
    division: translations.__(`division.${division.toString()}`),
    subject: translations.__(`subject.${subject}`),
  });

  const subjectImagesMessages = await getSubjectImagesMessageContent({
    organizationId,
    userId,
    examId,
  });

  const examAnalysisMessages = await getSubjectAnalysisMessageContent({
    organizationId,
    userId,
    examId,
  });

  const responseImagesMessages = await getResponseImagesMessageContent({
    organizationId,
    userId,
    examId,
    fileId,
  });

  const task: ChatMessageContent = {
    type: 'text' as const,
    text: translations.__('responseAnalysis.humanMessage.task'),
  };

  const humanMessage = new HumanMessage({
    content: [
      ...subjectImagesMessages,
      ...examAnalysisMessages,
      ...responseImagesMessages,
      task,
    ],
  });

  const chat = new ChatOpenAI({
    apiKey: Config.OPENAI_API_KEY,
    temperature: 0,
    modelName: 'gpt-4o-mini',
    configuration: {
      project: Config.OPENAI_PROJECT_ID,
    },
    // verbose: process.env.STAGE === 'local',
  }).withStructuredOutput(
    getResponseOutputSchema({
      questionId: translations.__('examAnalysis.outputSchema.questionId'),
      answer: translations.__('examAnalysis.outputSchema.answer'),
      name: translations.__('examAnalysis.outputSchema.name'),
      answers: translations.__('examAnalysis.outputSchema.answer'),
      mark: translations.__('responseAnalysis.outputSchema.mark'),
      correction: translations.__('responseAnalysis.outputSchema.correction'),
    }),
  );

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', context],
    humanMessage,
  ]);

  const chain = RunnableSequence.from([prompt, chat]);

  return chain;
};
