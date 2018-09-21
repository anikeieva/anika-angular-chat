import {User} from './user';

export class Message {
  user: User;
  action: string;
  messageContent: string;
  sendingTime: Date;

  constructor(user: User, action: string, messageContent: string, sendingTime) {
    this.user = user;
    this.action = action;
    this.messageContent = messageContent;
    this.sendingTime = sendingTime;
  }
}
