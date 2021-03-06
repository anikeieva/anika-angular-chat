import * as mongoose from "mongoose";
import {userSchema} from "./user";

const messagesSchema = new mongoose.Schema({
    from: userSchema,
    messageContent: String,
    sendingTime: Date,
    action: String,
    to: userSchema,
    edited: Boolean
});

export default messagesSchema;
