import {UserAction} from './userAction';

export interface User {
  firstName: string;
  lastName: string;
  gender: string;
  avatar: string | ArrayBuffer;
  action: UserAction;
}
