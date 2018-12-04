import * as mongoose from "mongoose";

export default function getMongodb () {
    mongoose.connect('mongodb://localhost/anika-angular-chat', {useNewUrlParser: true}).then(() => {
        console.log("Connected to Database");
    }).catch((err) => {
        console.log("Not Connected to Database ERROR! ", err);
    });
}