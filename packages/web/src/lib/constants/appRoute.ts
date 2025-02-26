import { LOGIN_PATH } from '@corrector/shared';

export enum AppRoute {
  Home = '/',
  Login = `/${LOGIN_PATH}`,
  NotFound = '/not-found',
  Error = '/error',
  Welcome = '/welcome',
  People = '/people',
  Divisions = '/divisions',
  Settings = '/settings',
  Exams = '/exams',
  Classrooms = '/classrooms',
  ClassroomExam = '/classrooms/:classroomId/exams/:examId',
  ClassroomExams = '/classrooms/:classroomId/exams',
  ClassroomUsers = '/classrooms/:classroomId/users',
  AssignedExams = '/exams/classrooms',
  CreateExam = '/exams/create',
  School = '/schools/:schoolId',
}
