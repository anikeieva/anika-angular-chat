import * as mongoose from "mongoose";

export default function getMongodb () {
    mongoose.connect('mongodb://192.168.88.112:8081/anika-angular-chat', {useNewUrlParser: true, useFindAndModify: false}).then(() => {
        console.log("Connected to Database");
    }).catch((err) => {
        console.log("Not Connected to Database ERROR! ", err);
    });
}