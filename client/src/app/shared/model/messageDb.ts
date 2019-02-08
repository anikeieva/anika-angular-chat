import {User} from './user';

export class MessageDb {
  _id: string;
  from: User;
  messageContent: string;
  sendingTime: Date;
  action: string;
  to: User;
  edited: boolean;

  constructor(_id, from, messageContent, sendingTime, action, to, edited) {
    this._id = _id;
    this.from = from;
    this.messageContent = messageContent;
    this.sendingTime = sendingTime;
    this.action = action;
    this.to = to;
    this.edited = edited;
  }
}
