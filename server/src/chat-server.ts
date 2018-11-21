import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as session from "express-session";
import * as sharedSession from "express-socket.io-session";
// import * as cookie from "cookie";
import * as mongoose from "mongoose";

import {Message} from './model';
import {User} from "./model/user";
import {UserLogInParam} from "./model/userLogInParam";
import {TypeChatRooms} from "./model/type-chat-rooms";

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    public mainChatRoomDefault: any;
    public sessionMiddleware: session;
    public userSchema: any;
    public User: any;
    private chatRoomSchema: any;
    public messagesSchema: any;
    public ChatRoom: any;
    public Messages: any;

    constructor() {

        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.getSession();
        this.listen();
        this.getMongodb();

    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private getSession() {
        this.sessionMiddleware = session({
            secret: "secret",
            resave: true,
            saveUninitialized: true
        });
        this.app.use(this.sessionMiddleware);
        this.io.use(sharedSession(this.sessionMiddleware));
    }

    private async getMongodb() {
        mongoose.connect('mongodb://localhost/anika-angular-chat', {useNewUrlParser: true}).then(() => {
            console.log("Connected to Database");
        }).catch((err) => {
            console.log("Not Connected to Database ERROR! ", err);
        });

        this.userSchema = mongoose.Schema({
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

        this.messagesSchema = mongoose.Schema({
            user: this.userSchema,
            messageContent: String,
            sendingTime: Date,
            action: String
        });

        this.chatRoomSchema = mongoose.Schema({
            id: String,
            name: String,
            avatar: String,
            type: String,
            lastMessage: String,
            users: [this.userSchema],
            activeUsers: [this.userSchema],
            messages: [this.messagesSchema]
        });

        this.User = mongoose.model('User', this.userSchema);
        this.ChatRoom = mongoose.model('ChatRoomSchema', this.chatRoomSchema);
        this.Messages = mongoose.model('Messages', this.messagesSchema);

        const mainChatOptions = {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        };

        this.mainChatRoomDefault = {
            id: 'main-chat',
            name: 'Main chat',
            avatar: 'src/app/images/chat/chat.png',
            type: TypeChatRooms.chat,
            lastMessage: 'online chat'
        }; // later add to separate file

        this.ChatRoom.findOneAndUpdate({id: 'main-chat'}, this.mainChatRoomDefault, mainChatOptions, (err) => {
            if (err) throw  err;
        });
    }

    private clearMongooseData() {
        this.User.remove({online: true}, (err) => console.log(err));
        this.User.remove({online: false}, (err) => console.log(err));

        this.ChatRoom.remove({name: 'Main chat'}, (err) => console.log(err));
    }

    private listen(): void {

        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);

            // this.clearMongooseData();

            this.ChatRoom.find((err, room) => {
                if (err) throw err;

                console.log('man chat room int', room);
            }); // for only reading in terminal!

            socket.on('requestForMainChatRoom', ( async () => {

                await this.ChatRoom.findOne({id: 'main-chat'}, (err, room) => {
                    if (err) throw  err;

                    this.io.emit('mainChatRoom', room);

                });
            }));

            socket.on('userLogInParam', async (userLogInParam: UserLogInParam) => {


                await this.User.findOne({
                    login: userLogInParam.login,
                    password: userLogInParam.password
                }, async (err, user) => {
                    if (err) throw  err;

                    if (user) {

                        user.online = true;
                        user.save((err) => {
                            if (err) throw  err;
                        });
                        console.log('user update log in: ', user);

                        await this.ChatRoom.findOneAndUpdate({
                                id: 'main-chat',
                                users: {$elemMatch: {id: user.id}}
                            },
                            {$set: {'users.$': user}}, (err) => {
                                if (err) throw  err;
                            });

                        await this.ChatRoom.findOne({id: 'main-chat'}, async (err, room) => {

                            if (err) throw err;

                            room.activeUsers = await room.users.filter((item) => item.online);

                            await room.save((err) => {
                                    if (err) throw err
                                }
                            );

                            console.log('man chat room after log in', room);
                        });


                        socket.join(user.id);
                        console.log('User log in: ', user);
                        this.io.emit('userLogIn', user);
                        this.io.to(user.id).emit('user', user);
                    } else {
                        console.log('User not log in!');
                        this.io.emit('userNotLogIn', 'userNotLogIn');
                    }
                });

            });

            socket.on('user', async (user: User) => {

                await this.User.find(async (err, users) => {

                    if (err) throw err;

                    if (users.some(item => item.id === user.id)) {

                        await this.User.findOneAndUpdate({id: user.id}, user, (err) => {
                            if (err) throw  err;
                        });

                    } else {

                        user.id = users.length + 1 + '';
                        const newUser = new this.User(user);

                        await newUser.save((err) => {
                            if (err) throw err;
                        });

                        socket.join(user.id);
                    }

                    this.io.to(user.id).emit('user', user);
                });
            });

            socket.on('mainChatUser', async (user) => {

                await this.ChatRoom.findOne({id: 'main-chat'}, async (err, room) => {
                    if (err) throw  err;

                    console.log('user: ', user);

                    if (room.users.some(item => item.id === user.id)) {

                        await this.ChatRoom.findOneAndUpdate({'id': 'main-chat', users: {$elemMatch: {id: user.id}}},
                            {$set: {'users.$': user}}, (err) => {
                                if (err) throw  err;
                            });

                    } else {
                        room.users.push(user);
                    }

                    console.log('main chat room before activU:', room);
                    room.activeUsers = await room.users.filter((item) => item.online);

                    await room.save((err) => {
                        if (err) throw err;
                    });


                    this.io.emit('mainChatRoom', room);
                    console.log('main chat room ', room);
                });
            });


            socket.on('mainChatMessage', async (m: Message) => {

                await this.ChatRoom.findOne({id: 'main-chat'}, async (err, room) => {

                    if (err) throw  err;

                    room.messages.push(m);

                    // room.activeUsers = await room.users.filter((item) => item.online);

                    await room.save((err) => {
                        if (err) throw err;
                    });

                    console.log('main chat room messages', room);

                    this.io.emit('mainChatMessage', m);

                });
            });

            this.ChatRoom.findOne({id: 'main-chat'}, (err, room) => {
                if (err) throw  err;

                if (room) {
                    this.io.emit('mainChatMessages', room.messages);
                }
            });

            socket.on('userLogOut', (user: User) => {
                socket.leave(user.id);

                this.ChatRoom.find({}, async (err, room) => {
                    if (err) throw err;

                    console.log('man chat room client log out', room);
                });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');

            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}