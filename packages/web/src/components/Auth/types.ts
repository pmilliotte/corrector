export type LoginState =
  | 'login'
  | 'newPasswordRequired'
  | 'signup'
  | 'confirmSignup';

export const PASSWORD_REGEXP =
  /^(?!\s+)(?!.*\s+$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ])[A-Za-z0-9$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{8,256}$/;
