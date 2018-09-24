import {User} from './user';

export class Message {
  user: User;
  messageContent: string;
  sendingTime: Date;

  constructor(user, messageContent, sendingTime) {
    this.user = user;
    this.messageContent = messageContent;
    this.sendingTime = sendingTime;
  }
}
