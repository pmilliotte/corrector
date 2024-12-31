import { MathJax } from 'better-react-mathjax';
import { Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { ProblemAnalysis, QuestionAnalysis } from '@corrector/shared';

import { trpc, useUserOrganizations } from '~/lib';

import { Card, CardContent, CardHeader, CardTitle, Separator } from '../ui';

type ResponseAnalysisProps = {
  examId: string;
  responseId: string;
};

export const ResponseAnalysis = ({
  examId,
  responseId,
}: ResponseAnalysisProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { data: examAnalysis, isLoading: examLoading } =
    trpc.examSubjectAnalysisGet.useQuery({
      id: examId,
      organizationId: selectedOrganization.id,
    });
  const { data: responseAnalysis, isLoading: responseLoading } =
    trpc.examResponseAnalysisGet.useQuery({
      id: responseId,
      organizationId: selectedOrganization.id,
      examId,
    });

  if (examLoading || responseLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (examAnalysis === undefined || responseAnalysis === undefined) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(
        examAnalysis.problems as Record<string, ProblemAnalysis>,
      ).map(([problemId, { problemPath, problemTitle, questions }]) => (
        <div className="flex flex-col gap-1" key={problemId}>
          <div className="font-bold text-muted-foreground">
            <FormattedMessage
              id="exams.problem.title"
              values={{ title: problemTitle, path: problemPath }}
            />
          </div>
          {Object.entries(questions as Record<string, QuestionAnalysis>).map(
            ([questionId, question]) => (
              <Card key={problemId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="grow flex items-center justify-between">
                      <div>
                        <FormattedMessage
                          id="exams.problem.question.title"
                          values={{ path: question.path }}
                        />
                      </div>
                      <FormattedMessage
                        id="exams.problem.question.mark"
                        values={{
                          total: question.mark,
                          mark: responseAnalysis.studentAnswersAnalysis.find(
                            item =>
                              item.problemUuid === problemId &&
                              item.questionUuid === questionId,
                          )?.studentScore,
                        }}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MathJax dynamic className="grow whitespace-pre-wrap">
                      {
                        responseAnalysis.studentAnswersAnalysis.find(
                          item =>
                            item.problemUuid === problemId &&
                            item.questionUuid === questionId,
                        )?.totalAndFaithfulStudentReasoningTranscript
                      }
                    </MathJax>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MathJax dynamic className="grow whitespace-pre-wrap">
                      {
                        responseAnalysis.studentAnswersAnalysis.find(
                          item =>
                            item.problemUuid === problemId &&
                            item.questionUuid === questionId,
                        )?.correction
                      }
                    </MathJax>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      ))}
    </div>
  );
};
