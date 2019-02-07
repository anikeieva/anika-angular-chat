import { Message, User } from './';

export class ChatMessage extends Message{
    constructor(user: User, messageContent: string, sendingTime: Date, action: string, to: User, edited: boolean) {
        super(user, messageContent, sendingTime, action, to, edited);
    }
}