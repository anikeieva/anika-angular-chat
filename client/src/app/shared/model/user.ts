import {UserAction} from './userAction';

export interface User {
  login: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  avatar: string | ArrayBuffer;
  action: UserAction;
}
