import * as mongoose from "mongoose";
import {userSchema} from "./user";
import messagesSchema from "./messages";
import {TypeChatRooms} from "../model/type-chat-rooms";


export const chatRoomSchema = new mongoose.Schema({
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

export const ChatRoomModel = mongoose.model('ChatRoomModel', chatRoomSchema);

const chatOptions = {
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

ChatRoomModel.findOneAndUpdate({id: 'main-chat'}, mainChatRoomDefault, chatOptions, (err) => {
    if (err) throw  err;
});
