import { ReactElement } from 'react';

import { QuestionAnalysis } from '@corrector/shared';

import { UpdateExamQuestionsTools } from '~/lib';

import { Card, CardContent, CardHeader, CardTitle, Separator } from '../../ui';
import { QuestionText } from './QuestionText';
import { QuestionTitle } from './QuestionTitle';

type QuestionProps = {
  question: QuestionAnalysis;
  questionId: string;
  problemId: string;
  updateExamQuestionsTools: UpdateExamQuestionsTools;
};

export const Question = ({
  question,
  questionId,
  problemId,
  updateExamQuestionsTools,
}: QuestionProps): ReactElement => {
  const { path, statement, answer, mark } = question;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QuestionTitle
            questionPath={path}
            mark={mark}
            updateExamQuestionsTools={updateExamQuestionsTools}
            questionId={questionId}
            problemId={problemId}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <QuestionText
            updateExamQuestionsTools={updateExamQuestionsTools}
            questionId={questionId}
            problemId={problemId}
            text={statement}
            propertyName="statement"
          />
        </div>
        <Separator />
        <div className="flex items-center gap-2">
          <QuestionText
            updateExamQuestionsTools={updateExamQuestionsTools}
            questionId={questionId}
            problemId={problemId}
            text={answer}
            propertyName="answer"
          />
        </div>
      </CardContent>
    </Card>
  );
};
