import * as mongoose from "mongoose";
import {TypeChatRooms} from "../model/type-chat-rooms";
import {messagesSchema} from "./messages";
import {userSchema} from "./user";

const chatRoomSchema = mongoose.Schema({
    id: String,
    name: String,
    avatar: String,
    type: String,
    lastMessage: String,
    users: [userSchema],
    activeUsers: [userSchema],
    messages: [messagesSchema]
});

chatRoomSchema.methods.getActiveUsers = function() {
    if (this.users.length > 0) {
        this.activeUsers = this.users.filter(item => item.online);
    }
};

export const ChatRoomModel = mongoose.model('ChatRoomSchema', chatRoomSchema);

const mainChatOptions = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
};

const mainChatRoomDefault = {
    id: 'main-chat',
    name: 'Main chat',
    avatar: 'src/app/images/chat/chat.png',
    type: TypeChatRooms.chat,
    lastMessage: 'online chat'
};

ChatRoomModel.findOneAndUpdate({id: 'main-chat'}, mainChatRoomDefault, mainChatOptions, (err) => {
    if (err) throw  err;
});