import {User} from "./user";

export interface IChatRoomOptions {
  id: string;
  name: string;
  avatar: string;
  type: string;
  lastMessage: string;
  lastMessageFromCurrentUser: boolean;
  users: Array<User>;
  activeUsers: Array<User>;
  from: string;
  to: string;
}

export class ChatRoom {
  id: string;
  name: string;
  avatar: string;
  type: string;
  lastMessage: string;
  lastMessageFromCurrentUser: boolean;
  users: Array<User>;
  activeUsers: Array<User>;
  from: string;
  to: string;

  constructor(options: IChatRoomOptions) {
    this.id = options.id;
    this.name = options.name;
    this.avatar = options.avatar;
    this.type = options.type;
    this.lastMessage = options.lastMessage;
    this.lastMessageFromCurrentUser = options.lastMessageFromCurrentUser;
    this.users = options.users;
    this.activeUsers = options.activeUsers;
    this.from = options.from;
    this.to = options.to;
  }
}
