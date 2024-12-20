import { CirclePlus, Loader2 } from 'lucide-react';
import { Fragment, ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc, useUserOrganizations } from '~/lib';
import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '../../ui';
import { QuestionInstructions } from './QuestionInstructions';
import { QuestionMethodStep } from './QuestionMethodStep';
import { QuestionStatement } from './QuestionStatement';
import { QuestionTitle } from './QuestionTitle';

type QuestionProps = {
  questionId: string;
  problemId: string;
  updateExamQuestionTools: UpdateExamQuestionTools;
};

export const Question = ({
  questionId,
  problemId,
  updateExamQuestionTools,
}: QuestionProps): ReactElement => {
  const { getCurrentQuestion, isDrafting, examId } = updateExamQuestionTools;
  const question = getCurrentQuestion({ problemId, questionId });
  const { selectedOrganization } = useUserOrganizations();
  const utils = trpc.useUtils();
  const { mutate: addMethodStep, isPending: addMethodStepPending } =
    trpc.examSubjectAnalysisQuestionMethodAdd.useMutation({
      onSuccess: async () => {
        await utils.examSubjectAnalysisGet.invalidate();
      },
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QuestionTitle
            updateExamQuestionTools={updateExamQuestionTools}
            questionId={questionId}
            problemId={problemId}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <QuestionStatement
            updateExamQuestionTools={updateExamQuestionTools}
            questionId={questionId}
            problemId={problemId}
          />
        </div>
        <Separator />
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <QuestionInstructions
            updateExamQuestionTools={updateExamQuestionTools}
            questionId={questionId}
            problemId={problemId}
          />
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">
            <FormattedMessage id="exams.problem.question.method" />
          </div>
          {question.method.map(methodStep => (
            <Fragment key={methodStep.id}>
              <QuestionMethodStep
                updateExamQuestionTools={updateExamQuestionTools}
                questionId={questionId}
                problemId={problemId}
                methodStep={methodStep}
              />
            </Fragment>
          ))}
          <div className="flex items-center justify-around">
            <Button
              variant="ghost"
              className="flex gap-2"
              disabled={isDrafting()}
              onClick={() =>
                addMethodStep({
                  problemId,
                  questionId,
                  organizationId: selectedOrganization.id,
                  examId,
                })
              }
            >
              {addMethodStepPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CirclePlus size={16} />
              )}
              <FormattedMessage id="exams.problem.question.methodStep.addStep" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
