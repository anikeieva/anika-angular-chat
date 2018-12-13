import {User} from './user';

export class Message {
  from: User;
  messageContent: string;
  sendingTime: Date;
  action: string;

  constructor(from, messageContent, sendingTime, action) {
    this.from = from;
    this.messageContent = messageContent;
    this.sendingTime = sendingTime;
    this.action = action;
  }
}
