import * as mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
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
    lastSeen: Date
}, {versionKey: false});


export const UserModel = mongoose.model('User', userSchema);