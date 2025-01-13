import { Exam } from '../entities';

type ProblemContent = NonNullable<
  Exam['problems']['configureProblems'][0]
>['content'];

export const reindexStatements = (content: ProblemContent): ProblemContent => {
  let questionIndex = 0;

  return content.reduce((acc, statement) => {
    if (statement.type === 'statement') {
      return [...acc, statement];
    }

    questionIndex++;

    return [...acc, { ...statement, index: questionIndex }];
  }, [] as ProblemContent);
};
