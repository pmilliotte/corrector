import { createContext, useContext } from 'react';

import { USER_ID_PLACEHOLDER } from '../constants';
import { Session } from '../types';

const defaultSession = {
  email: 'placeholder@email.com',
  id: USER_ID_PLACEHOLDER,
  firstName: 'firstName',
  lastName: 'lastName',
  organizations: {},
};

export const SessionContext = createContext<Session>(defaultSession);

export const useSession = (): Session => useContext(SessionContext);
