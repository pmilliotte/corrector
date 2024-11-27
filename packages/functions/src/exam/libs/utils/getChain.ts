import { BaseMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Config } from 'sst/node/config';

import { Subject } from '@corrector/shared';

import { i18n } from './i18n';

export const getChain = ({
  subject,
  division,
}: {
  subject: Subject;
  division: string;
}): RunnableSequence => {
  const chat = new ChatOpenAI({
    apiKey: Config.OPENAI_API_KEY,
    temperature: 0,
    modelName: 'gpt-4o-mini',
    configuration: {
      project: Config.OPENAI_PROJECT_ID,
    },
    verbose: process.env.STAGE === 'local',
  });

  console.log(i18n.getLocales());
  console.log(i18n.getLocale());
  const context = i18n.__('context');

  console.log('subject', subject);
  console.log('division', division);
  console.log('context', context);

  const prompt = ChatPromptTemplate.fromMessages<{
    problem: string;
    questionPath: string;
    logicsAnswersAsString: string;
    chatHistory: BaseMessage[];
    input: string;
    nextSentence: string;
    nextLabel: string;
    logicsAsString: string;
    instructionsAsString?: string;
  }>([['system', context]]);

  return RunnableSequence.from([prompt, chat, new StringOutputParser()]);
};
