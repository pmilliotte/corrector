import { MathJax } from 'better-react-mathjax';
import { Ban, Check, Eye, Loader2, SquarePen } from 'lucide-react';
import { ReactElement, useState } from 'react';

import { UpdateExamQuestionsTools } from '~/lib';

import { Button, Textarea } from '../../ui';

type QuestionTextProps = {
  questionId: string;
  problemId: string;
  text: string;
  updateExamQuestionsTools: UpdateExamQuestionsTools;
  propertyName: 'questionStatement' | 'answer';
};

export const QuestionText = ({
  text,
  updateExamQuestionsTools,
  questionId,
  problemId,
  propertyName,
}: QuestionTextProps): ReactElement => {
  const [updating, setUpdating] = useState(false);
  const [newText, setNewText] = useState<string>(text);
  const {
    updateQuestion,
    cancelUpdate,
    getQuestion,
    isLoading,
    isDrafting,
    examAnalysis,
    validateUpdate,
  } = updateExamQuestionsTools;

  if (updating) {
    return (
      <>
        <Textarea value={newText} onChange={e => setNewText(e.target.value)} />
        <div className="flex items-center gap-1 text-primary">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              newText !== text &&
                updateQuestion({
                  questionId,
                  problemId,
                  propertyName,
                  value: newText,
                });
              setUpdating(false);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              cancelUpdate();
              setNewText(text);
              setUpdating(false);
            }}
          >
            <Ban size={16} />
          </Button>
        </div>
      </>
    );
  }
  const question = getQuestion({ questionId, problemId });
  const isPropertyDrafting = isDrafting({
    problemId,
    questionId,
    propertyName,
  });
  const isPropertyLoading = isLoading({ problemId, questionId, propertyName });

  return (
    <>
      <MathJax dynamic className="grow whitespace-pre-wrap">
        {question[propertyName]}
      </MathJax>
      <div className="flex items-center gap-1 text-primary">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setUpdating(true)}
          disabled={
            (examAnalysis.updatingQuestion !== undefined &&
              !isPropertyDrafting) ||
            isPropertyLoading
          }
        >
          <SquarePen size={16} />
        </Button>
        <Button
          onClick={validateUpdate}
          disabled={!isPropertyDrafting}
          size="icon"
        >
          {isPropertyLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </Button>
      </div>
    </>
  );
};
