import {User} from './user';

export class Message {
  user: User;
  action: string;
  messageContent: string;

  constructor(user: User, action: string, messageContent: string) {
    this.user = user;
    this.action = action;
    this.messageContent = messageContent;
  }
}
