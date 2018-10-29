import {User} from "./user";
import {Message} from "./message";

export interface IChatRoomOptions {
    id: string;
    name: string;
    avatar: string;
    type: string;
    lastMessage: string;
    users: Array<User>;
    activeUsers: Array<User>;
    messages: Array<Message>;
}

export class ChatRoom {
  id: string;
  name: string;
  avatar: string;
  type: string;
  lastMessage: string;
  users: Array<User>;
  activeUsers: Array<User>;
  messages: Array<Message>;

  constructor(options: IChatRoomOptions) {
    this.id = options.id;
    this.name = options.name;
    this.avatar = options.avatar;
    this.type = options.type;
    this.lastMessage = options.lastMessage;
    this.users = options.users;
    this.activeUsers = options.activeUsers;
    this.messages = options.messages;
  }
}
