import * as mongoose from "mongoose";

export default function getMongodb () {
    mongoose.connect('mongodb://192.168.88.116:8081/anika-angular-chat', {useNewUrlParser: true}).then(() => {
        console.log("Connected to Database");
    }).catch((err) => {
        console.log("Not Connected to Database ERROR! ", err);
    });
}