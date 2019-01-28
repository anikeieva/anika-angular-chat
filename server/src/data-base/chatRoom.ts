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
    messages: [messagesSchema],
    from: String,
    to: String
}, {versionKey: false});

chatRoomSchema.methods.getActiveUsers = function() {
    if (this.users.length > 0) {
        this.activeUsers = this.users.filter(item => item.online);
    }
};

// chatRoomSchema.pre('save', function() {
//     const update = this.getUpdate();
//     if (update.__v != null) {
//         delete update.__v;
//     }
//     const keys = ['$set', '$setOnInsert'];
//     for (const key of keys) {
//         if (update[key] != null && update[key].__v != null) {
//             delete update[key].__v;
//             if (Object.keys(update[key]).length === 0) {
//                 delete update[key];
//             }
//         }
//     }
//     update.$inc = update.$inc || {};
//     update.$inc.__v = 1;
// });
//
// chatRoomSchema.pre('findOneAndUpdate', function() {
//     const update = this.getUpdate();
//     if (update.__v != null) {
//         delete update.__v;
//     }
//     const keys = ['$set', '$setOnInsert'];
//     for (const key of keys) {
//         if (update[key] != null && update[key].__v != null) {
//             delete update[key].__v;
//             if (Object.keys(update[key]).length === 0) {
//                 delete update[key];
//             }
//         }
//     }
//     update.$inc = update.$inc || {};
//     update.$inc.__v = 1;
// });

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
