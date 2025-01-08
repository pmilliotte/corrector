import { ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppRoute } from '~/lib';
import {
  Classrooms,
  Error,
  Exams,
  ExamWrapper,
  Login,
  NotFound,
  People,
  Settings,
} from '~/pages';
import { ClassroomWrapper } from '~/pages/ClassroomWrapper';

import { Layout } from '../Layout';
import { AuthenticationRequired } from './AuthenticationRequired';

export const AppRoutes = (): ReactElement => (
  <BrowserRouter>
    <Routes>
      <Route
        path={AppRoute.Home}
        element={<Navigate to={AppRoute.Classrooms} />}
      />
      <Route element={<AuthenticationRequired />}>
        <Route element={<Layout />}>
          <>
            <Route path={AppRoute.People} element={<People />} />
            <Route
              path={`${AppRoute.Classrooms}/:classroomId`}
              element={<ClassroomWrapper />}
            />
            <Route path={AppRoute.Classrooms} element={<Classrooms />} />
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
