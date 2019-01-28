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
    lastSeen: Date,
    direct: [mongoose.Schema.Types.Mixed]
}, {versionKey: false});

// userSchema.pre('save', function() {
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
// userSchema.pre('findOneAndUpdate', function() {
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
// userSchema.pre('update', function() {
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

export const UserModel = mongoose.model('User', userSchema);