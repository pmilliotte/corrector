import { ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppRoute } from '~/lib';
import {
  ClassroomExam,
  Classrooms,
  Error,
  Exams,
  ExamWrapper,
  Login,
  NotFound,
  People,
  Settings,
} from '~/pages';
import { AssignedExams } from '~/pages/AssignedExams';
import { ClassroomExams } from '~/pages/ClassroomExams';
import { ClassroomUsers } from '~/pages/ClassroomUsers';
import { CreateExam } from '~/pages/CreateExam';

import { Layout } from '../Layout';
import { AuthenticationRequired } from './AuthenticationRequired';

export const AppRoutes = (): ReactElement => (
  <BrowserRouter>
    <Routes>
      <Route path={AppRoute.Home} element={<Navigate to={AppRoute.Exams} />} />
      <Route element={<AuthenticationRequired />}>
        <Route element={<Layout />}>
          <>
            <Route path={AppRoute.People} element={<People />} />
            <Route
              path={AppRoute.ClassroomUsers}
              element={<ClassroomUsers />}
            />
            <Route
              path={AppRoute.ClassroomExams}
              element={<ClassroomExams />}
            />
            <Route path={AppRoute.CreateExam} element={<CreateExam />} />
            <Route path={AppRoute.ClassroomExam} element={<ClassroomExam />} />
            <Route path={AppRoute.Classrooms} element={<Classrooms />} />
            <Route path={AppRoute.AssignedExams} element={<AssignedExams />} />
            <Route path={AppRoute.Settings} element={<Settings />} />
            <Route
              path={`${AppRoute.Exams}/:examId`}
              element={<ExamWrapper />}
            />
            <Route path={AppRoute.Exams} element={<Exams />} />
            <Route path={AppRoute.NotFound} element={<NotFound />} />
            <Route path={AppRoute.Error} element={<Error />} />
          </>
        </Route>
      </Route>
      <Route path={AppRoute.Login} element={<Login />} />
      <Route path="*" element={<Navigate to={AppRoute.NotFound} />} />
    </Routes>
  </BrowserRouter>
);
