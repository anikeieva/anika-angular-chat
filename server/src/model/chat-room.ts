import {User} from "./user";
import {Message} from "./message";

export class ChatRoom {
  id: string;
  name: string;
  avatar: string;
  type: string;
  lastMessage: string;
  users: Array<User>;
  activeUsers: Array<User>;
  messages: Array<Message>;

  constructor(id: string, name: string, avatar: string, type: string,
              lastMessage: string, users: Array<User>, activeUsers: Array<User>,
              messages: Array<Message>) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.type = type;
    this.lastMessage = lastMessage;
    this.users = users;
    this.activeUsers = activeUsers;
    this.messages = messages;
  }
}
