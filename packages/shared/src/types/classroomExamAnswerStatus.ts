import { CLASSROOM_EXAM_ANSWER_STATUSES } from '~/constants/classroomExamAnswerStatuses';

export type ClassroomExamAnswerStatus =
  (typeof CLASSROOM_EXAM_ANSWER_STATUSES)[number];
