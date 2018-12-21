import {ChatRoom} from "./chat-room";

export interface User {
    firstName: string;
    lastName: string;
    gender: string;
    login: string;
    password: string;
    avatar: string;
    action: object;
    id: string;
    online: boolean;
    direct: [ChatRoom];
    chat: [ChatRoom];
    lastSeen: Date;
}