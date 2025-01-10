import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

import { streamToString } from '@corrector/backend-shared';
import { EXAM_BLANK, examAnalysisSchema } from '@corrector/shared';

import { s3Client } from '~/clients';

import { ChatMessageContent } from '../../types';
import { getFileKeyPrefix } from '../getFileKeyPrefix';
import { translations } from '../i18n';

export const getSubjectAnalysisMessageContent = async ({
  organizationId,
  userId,
  examId,
}: {
  organizationId: string;
  userId: string;
  examId: string;
}): Promise<ChatMessageContent[]> => {
  const fileKeyPrefix = getFileKeyPrefix({
    organizationId,
    userId,
    examId,
    fileType: EXAM_BLANK,
  });

  const fileKey = `${fileKeyPrefix}/analysis.json`;

  const { Body: examBlankAnalysis } = await s3Client.send(
    new GetObjectCommand({
      Key: fileKey,
      Bucket: Resource['exam-bucket'].name,
    }),
  );

  if (examBlankAnalysis === undefined) {
    throw new Error();
  }

  const examBlankAnalysAsString = await streamToString(
    examBlankAnalysis as Readable,
  );

  const examAnalysis = examAnalysisSchema.parse(
    JSON.parse(examBlankAnalysAsString),
  );

  const analysisIntro: ChatMessageContent[] = [
    {
      type: 'text' as const,
      text: translations.__(
        'responseAnalysis.humanMessage.examAnalysis.introduction',
      ),
    },
    {
      type: 'text' as const,
      text: JSON.stringify(examAnalysis),
    },
  ];

  return analysisIntro;
};

// const getProblemsStatement = (examAnalysis: ExamAnalysis) =>
//   Object.entries(examAnalysis.problems).reduce(
//     (accProblem, [problemId, problem]) => {
//       // console.log('problem', problem);
//       const questionStatements = Object.entries(
//         problem?.questions ?? {},
//       ).reduce(
//         (accQuestion, [questionId, question]) =>
//           // console.log('question', question);

//           ({
//             ...accQuestion,
//             [questionId]: {
//               statement: question?.statement,
//               path: question?.path,
//               mark: question?.mark,
//             },
//           }),
//         {},
//       );

//       // console.log(accProblem);

//       return {
//         ...accProblem,
//         [problemId]: { ...problem, questions: questionStatements },
//       };
//     },
//     {},
//   );
