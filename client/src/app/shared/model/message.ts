import {User} from './user';

export class Message {
  user: User;
  messageContent: string;
  sendingTime: Date;
  action: string;

  constructor(user, messageContent, sendingTime, action) {
    this.user = user;
    this.messageContent = messageContent;
    this.sendingTime = sendingTime;
    this.action = action;
  }
}
