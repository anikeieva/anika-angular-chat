import { Message, User } from './';

export class ChatMessage extends Message{
    constructor(user: User, messageContent: string, sendingTime: Date, action: string) {
        super(user, messageContent, sendingTime, action);
    }
}