import {UserAction} from './userAction';

export interface User {
  firstName: string;
  lastName: string;
  gender: string;
  login: string;
  avatar: string | ArrayBuffer;
  action: UserAction;
  id: string;
  online: boolean;
  lastSeen: Date;
}
