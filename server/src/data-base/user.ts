import * as mongoose from "mongoose";
// import {chatRoomSchema} from "./chatRoom";

export const userSchema = new mongoose.Schema();
userSchema.add({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    gender: String,
    login: String,
    password: String,
    avatar: String,
    action: Object,
    id: String,
    online: Boolean,
    // direct: [chatRoomSchema]
    lastSeen: Date
});

export const UserModel = mongoose.model('User', userSchema);