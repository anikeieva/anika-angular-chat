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

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.getSession();
        this.listen();
        this.createChatRoom();
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

    private createChatRoom() {
        // const opt: IChatRoomOptions = {
        //     id: 'main-chat',
        //     name: 'Main chat',
        //     avatar: 'src/app/images/chat/chat.png',
        //     type: TypeChatRooms.chat,
        //     lastMessage: 'online chat',
        //     users: [],
        //     activeUsers: [],
        //     messages: []
        // };
        // this.mainChatRoom = new ChatRoom(opt);
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

    private getMongodb() {
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

        this.mainChatRoom = new this.ChatRoom({
            id: 'main-chat',
            name: 'Main chat',
            avatar: 'src/app/images/chat/chat.png',
            type: TypeChatRooms.chat,
            lastMessage: 'online chat'
        });

        this.ChatRoom.find({id: 'main-chat'},(err, room) => {
            if (err) throw  err;

            console.log('room if', room);

            if (!room) {
                this.mainChatRoom.save((err) => {
                    if (err) throw err;
                });
            }

            console.log(room);
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
                this.io.emit('mainChatRoom', this.mainChatRoom);
            }));

            socket.on('userLogInParam', (userLogInParam: UserLogInParam) => {

                let user: User;

                this.User.find((err, users) => {
                    if (err) throw err;

                    if (users.some(item => item.login === userLogInParam.login && item.password === userLogInParam.password )) {

                        users.forEach((item) => {
                            if (item.login === userLogInParam.login && item.password === userLogInParam.password) {
                                user = item;
                                this.User.findOneAndUpdate({login: userLogInParam.login, password: userLogInParam.password}, {online: true}, (err) => {
                                    if (err) throw  err;
                                });

                                this.User.find((err, users) => {
                                    if (err) console.log('err ', err);
                                    console.log('mongodb users update: ', users);
                                });
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

                this.User.find((err, users) => {
                    if (err) throw err;

                    if (users.some(item => item.id === user.id )) {

                        users.forEach((item) => {
                            if (item.id === user.id) {

                                this.User.findOneAndUpdate({id: user.id}, user, (err) => {
                                    if (err) throw  err;
                                });

                                this.User.find((err, users) => {
                                    if (err) console.log('err ', err);
                                    console.log('mongodb users update: ', users);
                                });

                            }
                        });

                    } else {

                        user.id = socket.id;
                        console.log('socketId', socket.id);
                        const newUser = new this.User(user);
                        newUser.save((err) => {
                            if (err) throw err;
                        });

                        this.User.find((err, users) => {
                            if (err) console.log('err ', err);
                            console.log('mongodb users new: ', users);
                        });
                    }

                    this.io.emit('user', user);
                });
            });

            socket.on('mainChatUser', (user) => {

                if (this.mainChatRoom.users.some(item => item.id === user.id)) {

                    this.mainChatRoom.users.forEach((item, i) => {
                        if (item.id === user.id) {
                            this.mainChatRoom.users[i] = user;
                        }
                    });

                    this.mainChatRoom.activeUsers.forEach((item, i) => {
                        if (item.id === user.id) {
                            this.mainChatRoom.activeUsers[i] = user;
                        }
                    });

                } else {
                    this.mainChatRoom.users.push(user);

                    if (user.online) {
                        this.mainChatRoom.activeUsers.push(user);
                    }
                }

                this.mainChatRoom.activeUsers.forEach((item) => {
                    if (!item.online) {
                        this.mainChatRoom.activeUsers.pull({_id: item._id});
                    }
                });

                this.mainChatRoom.save((err) => {
                    if (err) throw err;
                });

                console.log('main chat room ', this.mainChatRoom);
            });


            socket.on('mainChatMessage', (m: Message) => {

                this.mainChatRoom.messages.push(m);

                this.mainChatRoom.save((err) => {
                   if (err) throw err;
                });

                console.log('main chat room messages', this.mainChatRoom);

                this.io.emit('mainChatMessage', m);
            });

            this.io.emit('mainChatMessages', this.mainChatRoom.messages);

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