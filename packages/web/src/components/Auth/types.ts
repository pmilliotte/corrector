export type LoginState =
  | 'login'
  | 'newPasswordRequired'
  | 'signup'
  | 'confirmSignup';

export const PASSWORD_REGEXP =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s^$*.{}()?"!@#%&/\\,><':;|_~`+=]).+$/;
