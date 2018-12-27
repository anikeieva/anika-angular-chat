import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as session from "express-session";
import * as sharedSession from "express-socket.io-session";
// import * as cookie from "cookie";

import {Message} from './model';
import {User} from "./model/user";
import {UserLogInParam} from "./model/userLogInParam";
import * as mongoose from "mongoose";
import getMongodb from "./data-base/mongoose";
import {UserModel} from "./data-base/user";
import {ChatRoomModel} from "./data-base/chatRoom";
import {TypeChatRooms} from "./model/type-chat-rooms";
import {ChatRoom} from "../../client/src/app/shared/model/chat-room";
import {isString} from "typegoose/lib/utils";


export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    public sessionMiddleware: session;

    constructor() {

        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.getSession();
        this.listen();
        getMongodb();

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
        this.io.use(sharedSession(this.sessionMiddleware, {autoSave: true}));
    }

    private clearMongooseData() {
        UserModel.remove({online: true}, (err) => console.log(err));
        UserModel.remove({online: false}, (err) => console.log(err));

        ChatRoomModel.remove({name: 'Main chat'}, (err) => console.log(err));
        ChatRoomModel.remove({type: 'direct'}, (err) => console.log(err));
    }

    private listen(): void {

        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);


            // this.clearMongooseData();

            ChatRoomModel.find((err, room) => {
                if (err) throw err;

                console.log('man chat room int', room);
            }); // for only reading in terminal!

            socket.on('requestForMainChatRoom', ( async () => {

                await ChatRoomModel.findOne({id: 'main-chat'}, (err, room) => {
                    if (err) throw  err;

                    this.io.emit('mainChatRoom', room);

                });
            }));

            socket.on('requestForDirectMessagesRoomId', async (fromId, toId) => {

                await UserModel.findOne({id: fromId, direct: {$elemMatch: {from: fromId, to: toId}}}, async (err, room) => {
                    if (err) throw  err;
                    console.log('direct room: ', room);

                    if (room) {
                        console.log('room direct: ',room.direct);

                        if (room.id && room.direct) {
                            let directRoom;
                            for (let i=0; i < room.direct.length; i++) {
                                if (room.direct[i].from === fromId && room.direct[i].to === toId) {
                                    directRoom = room.direct[i];
                                }
                            }
                            console.log('directMessagesRoom', directRoom);
                            this.io.emit('directMessagesRoomId', directRoom.id);
                        }
                    } else {

                        const roomId = fromId*toId*Date.now();

                        await UserModel.findOne({id: toId}, async (err, to) => {
                            if (err) throw  err;
                            console.log('to: ', to);
                            if (to) {
                                const roomFrom = new ChatRoomModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    id: roomId,
                                    name: `${to.firstName} ${to.lastName}`,
                                    avatar: to.avatar,
                                    type: TypeChatRooms.direct,
                                    lastMessage: 'direct',
                                    to: to.id,
                                });


                                await UserModel.findOne({id: fromId}, async (err, from) => {
                                    if (err) throw  err;

                                    console.log('from: ', from);
                                    if (from) {
                                        roomFrom.users.push(from, to);
                                        roomFrom.from = from.id;
                                        from.direct.push(roomFrom);
                                        this.io.emit('directMessagesRoomId', roomFrom.id);
                                        console.log('from: ', from);

                                        await from.save((err) => {
                                            if (err) throw  err;
                                        });

                                        const roomTo = new ChatRoomModel({
                                            _id: new mongoose.Types.ObjectId(),
                                            id: roomId,
                                            name: `${from.firstName} ${from.lastName}`,
                                            avatar: from.avatar,
                                            type: TypeChatRooms.direct,
                                            lastMessage: 'direct',
                                            to: from.id,
                                            from: to.id
                                        });

                                        roomTo.users.push(to, from);

                                        to.direct.push(roomTo);
                                        console.log('to: ', to);

                                        await to.save((err) => {
                                            if (err) throw  err;
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            });

            socket.on('requestForDirectMessagesRoomById', ( async (roomId, fromId) => {

                await UserModel.findOne({id: fromId, direct: {$elemMatch: {id: roomId}}}, async (err, room) => {
                    if (err) throw  err;
                    console.log('direct room by id', room);

                    if (room) {
                        console.log('room.direct: by id',room.direct);
                        if (room.direct) {
                            let directRoom;
                            for (let i = 0; i < room.direct.length; i++) {
                                if (room.direct[i].id === roomId) {
                                    directRoom = room.direct[i];
                                }
                            }
                            console.log('DirectMessagesRoomById', directRoom);
                            this.io.emit('directMessagesRoomById', directRoom);
                        }
                    }
                });
            }));

            socket.on('requestForUserById', ( async (id) => {

                await UserModel.findOne({id: id}, (err, user) => {
                    if (err) throw  err;

                    this.io.emit('userById', user);
                });
            }));

            socket.on('requestForAllChatRooms', ( async (user: User) => {
                await ChatRoomModel.findOne({id: 'main-chat'}, (err, mainChatRoom) => {
                    if (err) throw  err;

                    let rooms = [];
                    rooms.push(mainChatRoom);

                    UserModel.findOne({id: user.id}, (err, item) => {
                        if (err) throw  err;

                        console.log('user.direct: ', item.direct);

                        for (let i = 0; i < item.direct.length; i++) {
                            rooms.push(item.direct[i]);
                        }

                        console.log('rooms: ', rooms);

                        this.io.emit('getAllChatRooms', rooms);
                    });
                });
            }));

            socket.on('userLogInParam', async (userLogInParam: UserLogInParam) => {


                await UserModel.findOne({
                    login: userLogInParam.login,
                    password: userLogInParam.password
                }, async (err, user) => {
                    if (err) throw  err;

                    if (user) {

                        user.online = true;
                        user.save((err) => {
                            if (err) throw  err;
                        });

                        console.log('User log in: ', user);
                        socket.join(user.id);
                        this.io.emit('userLogIn', user);
                        this.io.to(user.id).emit('user', user);

                        await ChatRoomModel.findOneAndUpdate({
                                id: 'main-chat',
                                users: {$elemMatch: {id: user.id}}
                            },
                            {$set: {'users.$.online': user.online}
                            }, (err) => {
                                if (err) throw  err;
                            });

                        await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {
                            if (err) throw  err;

                            room.getActiveUsers();

                            await room.save((err) => {
                                if (err) throw err;
                            });
                        });

                    } else {
                        console.log('User not log in!');
                        this.io.emit('userNotLogIn', 'userNotLogIn');
                    }
                });

            });

            socket.on('user', async (user: User) => {

                await UserModel.find(async (err, users) => {

                    if (err) throw err;

                    if (users.some(item => item.id === user.id)) {

                        await UserModel.findOneAndUpdate({id: user.id}, {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            gender: user.gender,
                            avatar: user.avatar,
                            action: user.action,
                            online: user.online,
                            direct: user.direct,
                            lastSeen: user.lastSeen
                        }, (err) => {
                            if (err) throw  err;
                        });

                        console.log('after update user 2: ', user);

                    } else {

                        user.id = users.length + 1 + '';

                        const newUser = new UserModel({
                            _id: new mongoose.Types.ObjectId(),
                            firstName: user.firstName,
                            lastName: user.lastName,
                            gender: user.gender,
                            login: user.login,
                            password: user.password,
                            avatar: user.avatar,
                            action: user.action,
                            id: user.id,
                            online: user.online
                        });

                        await newUser.save((err) => {
                            if (err) throw err;
                        });
                        socket.join(newUser.id);
                        this.io.to(newUser.id).emit('user', newUser);
                        socket.handshake.session.user = newUser;
                    }
                });
            });

            socket.on('mainChatUser', async (user) => {

                await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {
                    if (err) throw  err;

                    console.log('user: ', user);

                    if (room.users.some(item => item.id === user.id)) {

                        await ChatRoomModel.findOneAndUpdate({'id': 'main-chat', users: {$elemMatch: {id: user.id}}},
                            {$set: {
                                    'users.$.firstName': user.firstName,
                                    'users.$.lastName': user.lastName,
                                    'users.$.gender': user.gender,
                                    'users.$.avatar': user.avatar,
                                    'users.$.action': user.action
                                }}, (err) => {
                                if (err) console.log('main chat user update error ', err)
                            });

                        await ChatRoomModel.findOneAndUpdate({'id': 'main-chat', activeUsers: {$elemMatch: {id: user.id}}},
                            {$set: {
                                    'activeUsers.$.firstName': user.firstName,
                                    'activeUsers.$.lastName': user.lastName,
                                    'activeUsers.$.gender': user.gender,
                                    'activeUsers.$.avatar': user.avatar,
                                    'activeUsers.$.action': user.action
                                }}, (err) => {
                                if (err) console.log('main chat activeUsers update error ', err)
                            });

                    } else {

                        await UserModel.findOne({id: user.id}, async (err, item) => {
                            if (err) throw  err;

                            room.users.push(item);
                        });

                        room.getActiveUsers();

                        await room.save((err) => {
                            if (err) throw err;
                        });
                    }

                    this.io.emit('mainChatRoom', room);
                    console.log('main chat room added or updated user', room);
                });
            });


            socket.on('mainChatMessage', async (m: Message) => {

                await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {

                    if (err) console.log('main chat message err: ',err);

                    room.messages.push(m);

                    await room.save((err) => {
                        if (err) throw err;
                    });

                    console.log('main chat room messages', room);
                    this.io.emit('mainChatMessage', m);
                });
            });

            ChatRoomModel.findOne({id: 'main-chat'}, (err, room) => {
                if (err) throw  err;

                if (room) {
                    this.io.emit('mainChatMessages', room.messages);
                }
            });

            socket.on('directMessagesRoomMessage', async (message: Message, to: User) => {

                await UserModel.update({id: to.id, direct: {$elemMatch: {id: to.id}}},
                {$push: {'direct.$.messages': message}});

            });


            socket.on('userLogOut', async (user: User) => {

                const dateNow = new Date();

                await UserModel.find(async (err, users) => {

                    if (err) throw err;

                    if (users) {
                        await UserModel.findOneAndUpdate({id: user.id}, {online: false, lastSeen: dateNow}, (err, user) => {
                            if (err) throw  err;
                            console.log('user after log out update online: false: ', user);
                        });

                        console.log('users after log out: ', users);
                    }

                });


                await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {
                    if (err) throw err;

                    if (room.users) {
                        await ChatRoomModel.findOneAndUpdate({'id': 'main-chat', users: {$elemMatch: {id: user.id}}},
                            {
                                $set: {'users.$.online': false, 'users.$.lastSeen': dateNow}
                            }, (err, user) => {
                                if (err) console.log('main chat user log out update error ', err);

                                console.log('user main chat after log out update online: false: ', user);
                            });

                        await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {
                            if (err) throw  err;

                            room.getActiveUsers();

                            await room.save((err) => {
                                if (err) throw err;
                            });

                            this.io.emit('mainChatRoom', room);
                            console.log('man chat room client log out', room);
                        });
                    }
                });

                socket.leave(user.id);

            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
                console.log('socket.id', socket.id);
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}