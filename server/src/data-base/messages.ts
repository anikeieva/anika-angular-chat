import * as mongoose from "mongoose";
import {userSchema} from "./user";


export const messagesSchema = mongoose.Schema({
    user: userSchema,
    messageContent: String,
    sendingTime: Date,
    action: String
});
