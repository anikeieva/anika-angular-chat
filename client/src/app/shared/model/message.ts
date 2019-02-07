import {User} from './user';

export class Message {
  from: User;
  messageContent: string;
  sendingTime: Date;
  action: string;
  to: User;
  edited: boolean;

  constructor(from, messageContent, sendingTime, action, to, edited) {
    this.from = from;
    this.messageContent = messageContent;
    this.sendingTime = sendingTime;
    this.action = action;
    this.to = to;
    this.edited = edited;
  }
}
