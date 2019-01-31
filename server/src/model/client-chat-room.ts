import {User} from "./user";

export interface IClientChatRoomOptions {
    id: string;
    name: string;
    avatar: string;
    type: string;
    lastMessage: string;
    users: Array<User>;
    activeUsers: Array<User>;
    from: string;
    to: string;
}

export class ClientChatRoom {
  id: string;
  name: string;
  avatar: string;
  type: string;
  lastMessage: string;
  users: Array<User>;
  activeUsers: Array<User>;
  from: string;
  to: string;

  constructor(options: IClientChatRoomOptions) {
    this.id = options.id;
    this.name = options.name;
    this.avatar = options.avatar;
    this.type = options.type;
    this.lastMessage = options.lastMessage;
    this.users = options.users;
    this.activeUsers = options.activeUsers;
    this.from = options.from;
    this.to = options.to;
  }
}
