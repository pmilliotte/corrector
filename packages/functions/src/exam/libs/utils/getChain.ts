import { BaseMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Config } from 'sst/node/config';

import { getExamOutputSchema, Subject } from '@corrector/shared';

import { i18n } from './i18n';

export const getChain = ({
  subject,
  division,
}: {
  subject: Subject;
  division: string;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}) => {
  const examTitle = i18n.__('examAnalysis.examTitle');
  const problemTitle = i18n.__('examAnalysis.problemTitle');
  const problemPath = i18n.__('examAnalysis.problemPath');
  const questionPath = i18n.__('examAnalysis.questionPath');
  const questionStatement = i18n.__('examAnalysis.questionStatement');
  const answer = i18n.__('examAnalysis.answer');

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
      examTitle,
      problemTitle,
      problemPath,
      questionPath,
      questionStatement,
      answer,
    }),
  );

  const context = i18n.__('context', {
    division: i18n.__(`division.${division}`),
    subject: i18n.__(`subject.${subject}`),
  });

  const prompt = ChatPromptTemplate.fromMessages<{
    blankExam: BaseMessage[];
  }>([['system', context], new MessagesPlaceholder('blankExam')]);

  return RunnableSequence.from([prompt, chat]);
};
