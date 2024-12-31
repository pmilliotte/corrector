import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Config } from 'sst/node/config';

import { correctionOutputSchema, Division, Subject } from '@corrector/shared';

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

  const responseImagesMessages = await getResponseImagesMessageContent({
    organizationId,
    userId,
    examId,
    fileId,
  });

  const examAnalysisMessages = await getSubjectAnalysisMessageContent({
    organizationId,
    userId,
    examId,
  });

  const assistantSubjectMessage = new AIMessage({
    content: translations.__('responseAnalysis.humanMessage.subject'),
  });

  const subjectHumanMessage = new HumanMessage({
    content: subjectImagesMessages,
  });

  const assistantResponsesMessage = new AIMessage({
    content: translations.__('responseAnalysis.humanMessage.responses'),
  });

  const responsesHumanMessage = new HumanMessage({
    content: responseImagesMessages,
  });

  const examAnalysisHumanMessage = new HumanMessage({
    content: examAnalysisMessages,
  });

  const task = new HumanMessage({
    content: translations.__('responseAnalysis.humanMessage.task'),
  });

  const chat = new ChatOpenAI({
    apiKey: Config.OPENAI_API_KEY,
    temperature: 0,
    modelName: 'gpt-4o',
    configuration: {
      project: Config.OPENAI_PROJECT_ID,
    },
    verbose: process.env.STAGE === 'local',
  }).withStructuredOutput(correctionOutputSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', context],
    assistantSubjectMessage,
    subjectHumanMessage,
    assistantResponsesMessage,
    responsesHumanMessage,
    examAnalysisHumanMessage,
    task,
  ]);

  const chain = RunnableSequence.from([prompt, chat]);

  return chain;
};
