import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as session from "express-session";
import * as sharedSession from "express-socket.io-session";
import * as cookie from "cookie";
import * as mongoose from "mongoose";

import {Message} from './model';
import {User} from "./model/user";
import {UserLogInParam} from "./model/userLogInParam";
import {TypeChatRooms} from "./model/type-chat-rooms";
import {isString} from "typegoose/lib/utils";

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    public mainChatRoom: any;
    public sessionMiddleware: session;
    public userSchema: any;
    public User: any;
    private chatRoomSchema: any;
    public messagesSchema: any;
    public ChatRoom: any;
    public Messages: any;
    public mainChatOptions: object;

    constructor() {

        this.mainChatOptions = {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        };

        this.mainChatRoom = {
            id: 'main-chat',
            name: 'Main chat',
            avatar: 'src/app/images/chat/chat.png',
            type: TypeChatRooms.chat,
            lastMessage: 'online chat'
        };

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

        this.ChatRoom.findOneAndUpdate({id: 'main-chat'}, this.mainChatRoom, this.mainChatOptions, (err) => {
            if (err) throw  err;
        });
    }

    private listen(): void {

        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);

            // this.User.remove({online: true}, (err) => console.log(err));
            // this.User.remove({online: false}, (err) => console.log(err));
            //
            // this.ChatRoom.remove({name: 'Main chat'}, (err) => console.log(err));

            socket.cookie = socket.handshake.headers.cookie || socket.request.headers.cookie;

            this.ChatRoom.find((err, room) => {
                if (err) throw err;

                console.log('man chat room int', room);
            });

            socket.on('requestForMainChatRoom', ( () => {

                this.ChatRoom.findOne({id: 'main-chat'}, (err, room) => {
                    if (err) throw  err;

                    this.io.emit('mainChatRoom', room);

                });
            }));

            socket.on('userLogInParam', (userLogInParam: UserLogInParam) => {

                let user: User = null;

                this.User.find((err, users) => {
                    if (err) throw err;

                    if (users.some(item => item.login === userLogInParam.login && item.password === userLogInParam.password )) {

                        users.forEach(async (item) => {
                            if (item.login === userLogInParam.login && item.password === userLogInParam.password) {

                                user = item;
                                await this.User.findOneAndUpdate({
                                    login: userLogInParam.login,
                                    password: userLogInParam.password
                                }, {online: true}, (err) => {
                                    if (err) throw  err;
                                });

                                console.log('mongodb users update: ', users);
                            }
                        });
                    }

                    if (user) {
                        console.log('User log in: ', user);
                        this.io.emit('userLogIn', user);
                        this.io.emit('user', user);
                        socket.handshake.session.user = user;
                        socket.handshake.session.save();
                    } else {
                        console.log('User not log in!');
                        this.io.emit('userNotLogIn', 'userNotLogIn');
                    }

                });
            });

            socket.on('user', (user: User) => {

                this.User.find(async (err, users) => {
                    if (err) throw err;

                    if (users.some(item => item.id === user.id)) {

                        users.forEach(async (item) => {
                            if (item.id === user.id) {

                                await this.User.findOneAndUpdate({id: user.id}, user, (err) => {
                                    if (err) throw  err;
                                });

                                console.log('mongodb users update: ', users);
                            }
                        });

                    } else {

                        user.id = users.length + 1 + '';

                        console.log('users length: ', users.length);
                        const newUser = new this.User(user);

                        await newUser.save((err) => {
                            if (err) throw err;
                        });

                        socket.join(user.id);

                        console.log('mongodb users new: ', newUser);

                    }

                    this.io.to(user.id).emit('user', user);
                });
            });

            socket.on('mainChatUser', (user) => {

                this.ChatRoom.findOne({id: 'main-chat'}, async (err, room) => {
                    if (err) throw  err;

                    console.log('user: ', user);

                    if (room.users.some(item => item.id === user.id)) {

                        this.ChatRoom.findOneAndUpdate({'id': 'main-chat', users: {$elemMatch: {id: user.id}}},
                            {$set: {'users.$': user}}, (err) => {
                                if (err) throw  err;
                            });

                        this.ChatRoom.findOneAndUpdate({'id': 'main-chat', activeUsers: {$elemMatch: {id: user.id}}},
                            {$set: {'activeUsers.$': user}}, (err) => {
                                if (err) throw  err;
                            });

                    } else {
                        room.users.push(user);
                        room.activeUsers.push(user);
                    }

                    if (!user.online) {
                        this.ChatRoom.findOneAndUpdate({'id': 'main-chat', 'activeUsers.id': user.id}, {$pull: {activeUsers: user}}, (err) => {
                            if (err) throw  err;
                        });
                    }

                    await room.save((err) => {
                        if (err) throw err;
                    });

                    console.log('main chat room ', room);
                });
            });


            socket.on('mainChatMessage', (m: Message) => {

                this.ChatRoom.findOne({id: 'main-chat'}, async (err, room) => {

                    if (err) throw  err;

                    room.messages.push(m);

                    await room.save((err) => {
                        if (err) throw err;
                    });

                    console.log('main chat room messages', room);

                    this.io.emit('mainChatMessage', m);

                });
            });

            this.ChatRoom.findOne({id: 'main-chat'}, (err, room) => {
                if (err) throw  err;

                this.io.emit('mainChatMessages', room.messages);

            });

            socket.on('userLogOut', (user: User) => {
                if (socket.handshake.session.user) {
                    delete socket.handshake.session.user;
                    socket.handshake.session.save();
                }
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