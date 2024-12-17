import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Config } from 'sst/node/config';

import { Division, getExamOutputSchema, Subject } from '@corrector/shared';

import { ChatMessageContent } from '../../types';
import { translations } from '../i18n';
import { getSubjectImagesMessageContent } from './getSubjectImagesMessageContent';

export const getExamAnalysisChain = async ({
  division,
  subject,
  organizationId,
  userId,
  examId,
}: {
  division: Division;
  subject: Subject;
  organizationId: string;
  userId: string;
  examId: string;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}) => {
  const context = translations.__('examAnalysis.context', {
    division: translations.__(`division.${division.toString()}`),
    subject: translations.__(`subject.${subject}`),
  });

  const subjectMessages = await getSubjectImagesMessageContent({
    organizationId,
    userId,
    examId,
  });

  const task: ChatMessageContent = {
    type: 'text' as const,
    text: translations.__('examAnalysis.humanMessage.task'),
  };

  const humanMessage = new HumanMessage({
    content: [...subjectMessages, task],
  });

  const chat = new ChatOpenAI({
    apiKey: Config.OPENAI_API_KEY,
    temperature: 0,
    modelName: 'gpt-4o-mini',
    configuration: {
      project: Config.OPENAI_PROJECT_ID,
    },
    verbose: process.env.STAGE === 'local',
  }).withStructuredOutput(
    getExamOutputSchema({
      problemTitleDescription: translations.__(
        'examAnalysis.outputSchema.problemTitle',
      ),
      problemPathDescription: translations.__(
        'examAnalysis.outputSchema.problemPath',
      ),
      questionPathDescription: translations.__(
        'examAnalysis.outputSchema.questionPath',
      ),
      questionStatementDescription: translations.__(
        'examAnalysis.outputSchema.questionStatement',
      ),
      answerDescription: translations.__('examAnalysis.outputSchema.answer'),
      answerParagraphDescription: translations.__(
        'examAnalysis.outputSchema.answer.paragraph',
      ),
      methodDescription: translations.__('examAnalysis.outputSchema.method'),
      methodParagraphDescription: translations.__(
        'examAnalysis.outputSchema.method.paragraph',
      ),
    }),
  );

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', context],
    humanMessage,
  ]);

  const chain = RunnableSequence.from([prompt, chat]);

  return chain;
};
