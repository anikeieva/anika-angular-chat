import {TypeChatRooms} from "./type-chat-rooms";
import {User} from "./user";
import {Message} from "./message";

export interface ChatRoom {
  id: string;
  type: TypeChatRooms;
  users: Array<User>;
  messages: Array<Message>;
}
