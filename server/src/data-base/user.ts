import * as mongoose from "mongoose";

export const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    gender: String,
    login: String,
    password: String,
    avatar: String,
    action: Object,
    id: String,
    online: Boolean
});

export const UserModel = mongoose.model('User', userSchema);