import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as session from "express-session";
import * as sharedSession from "express-socket.io-session";

import {Message} from './model';
import {User} from "./model/user";
import {UserLogInParam} from "./model/userLogInParam";
import * as mongoose from "mongoose";
import getMongodb from "./data-base/mongoose";
import {UserModel} from "./data-base/user";
import {ChatRoomModel} from "./data-base/chatRoom";
import {TypeChatRooms} from "./model/type-chat-rooms";
import {ClientUser} from "./model/clientUser";


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

                    socket.join(fromId);
                    console.log('fromId', fromId);
                    console.log('toId', toId);

                    if (room) {
                        console.log('user request room id before', room);
                        if (room.id && room.direct) {
                            let directRoom;
                            for (let i=0; i < room.direct.length; i++) {
                                if (room.direct[i].from === fromId && room.direct[i].to === toId) {
                                    directRoom = room.direct[i];
                                }
                            }
                            this.io.to(fromId).emit('directMessagesRoomId', directRoom.id);
                        }
                    } else {

                        const roomId = fromId*toId*Date.now();

                        await UserModel.findOne({id: toId}, async (err, to) => {
                            if (err) throw  err;

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

                                    if (from) {
                                        roomFrom.users.push(from, to);
                                        roomFrom.from = from.id;
                                        console.log(`from id ${fromId} `,'user from request room id before', from);
                                        from.direct.push(roomFrom);

                                        this.io.to(fromId).emit('directMessagesRoomId', roomFrom.id);

                                        // await delete from.__v;

                                        await from.save((err) => {
                                            if (err) throw  err;
                                        });

                                        console.log(`from id ${fromId} `,'user from request room id after', from);

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

                                        console.log(`to id ${toId}`,'user to request room id before', to);

                                        roomTo.users.push(to, from);

                                        to.direct.push(roomTo);

                                        // await delete to.__v;

                                        await to.save((err) => {
                                            if (err) throw  err;
                                        });

                                        console.log(`to id ${toId}`,'user to request room id after', to);
                                    }
                                });
                            }
                        });

                    }
                });
            });

            socket.on('requestForDirectMessagesRoomById', ( async (fromId, roomId) => {

                await UserModel.findOne({id: fromId, direct: {$elemMatch: {id: roomId}}}, async (err, room) => {
                    if (err) throw  err;

                    if (room) {
                        console.log('user request room by id before:', room)
                        if (room.direct) {
                            let directRoom;
                            for (let i = 0; i < room.direct.length; i++) {
                                if (room.direct[i].id === roomId) {
                                    directRoom = room.direct[i];
                                }
                            }
                            console.log('DirectMessagesRoomById', directRoom);
                            socket.join(roomId);
                            this.io.to(roomId).emit(`directMessagesRoomById=${roomId}from=${fromId}`, directRoom);
                        }
                    }
                });
            }));

            socket.on('requestForUserById', ( async (id) => {

                await UserModel.findOne({id: id}, (err, user) => {
                    if (err) throw  err;

                    const clientUser = new ClientUser(user);
                    console.log('clientUser: ', clientUser);
                    this.io.emit(`userById=${id}`, clientUser);
                });
            }));

            socket.on('requestForAllChatRooms', ( async (user: User) => {
                await ChatRoomModel.findOne({id: 'main-chat'}, (err, mainChatRoom) => {
                    if (err) throw  err;

                    let rooms = [];
                    rooms.push(mainChatRoom);

                    UserModel.findOne({id: user.id}, (err, item) => {
                        if (err) throw  err;

                        for (let i = 0; i < item.direct.length; i++) {
                            rooms.push(item.direct[i]);
                        }

                        console.log('rooms requestForAllChatRooms: ', rooms);
                        this.io.to(user.id).emit('getAllChatRooms', rooms);
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

                        // await delete user.__v;

                        await user.save((err) => {
                            if (err) throw  err;
                        });

                        const clientUser = new ClientUser(user);
                        console.log('clientUser: ', clientUser);
                        console.log('User log in: ', user);
                        socket.join(clientUser.id);
                        this.io.emit('userLogIn', clientUser);
                        this.io.to(clientUser.id).emit('user', clientUser);

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

                            // await delete room.__v;

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
                            lastSeen: user.lastSeen
                        }, (err) => {
                            if (err) throw  err;
                        });

                        await UserModel.findOne({id: user.id}, (err, user) => {
                            if (err) throw err;

                            console.log('after update user 2: ', user);
                        });

                    } else {

                        await UserModel.findOne({login: user.login}, async (err, userWithItLogin) => {
                            if (err) throw err;

                            if (userWithItLogin) {
                                console.log('not unique login');
                                this.io.emit('userNotSignUp', 'userNotSignUp');
                            } else {

                                const userId = users.length + 1 + '';

                                const newUser = new UserModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    gender: user.gender,
                                    login: user.login,
                                    password: user.password,
                                    avatar: user.avatar,
                                    action: user.action,
                                    id: userId,
                                    online: user.online
                                });

                                // await delete newUser.__v;

                                await newUser.save((err) => {
                                    if (err) throw err;
                                });
                                console.log('new user: ', newUser);
                                socket.join(newUser.id);

                                const clientUser = new ClientUser(newUser);
                                console.log('clientUser: ', clientUser);
                                this.io.to(clientUser.id).emit('userSignUp', clientUser);
                                this.io.to(clientUser.id).emit('user', clientUser);
                            }
                        });
                    }
                });
            });

            socket.on('mainChatUser', async (user) => {

                await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {
                    if (err) throw  err;

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

                        // await delete room.__v;

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

                    // await delete room.__v;

                    await room.save((err) => {
                        if (err) throw err;
                    });

                    // console.log('main chat room messages', room);
                    this.io.emit('mainChatMessage', m);
                });
            });

            ChatRoomModel.findOne({id: 'main-chat'}, (err, room) => {
                if (err) throw  err;

                if (room) {
                    this.io.emit('mainChatMessages', room.messages);
                }
            });

            socket.on('directMessagesRoomMessage', async (message: Message, roomId: string) => {

                await UserModel.update({id: message.from.id, direct: {$elemMatch: {id: roomId}}},{
                    $push: {
                        'direct.$.messages': message
                    }
                });

                await UserModel.update({id: message.to.id, direct: {$elemMatch: {id: roomId}}},{
                    $push: {
                        'direct.$.messages': message
                    }
                });

                await ChatRoomModel.findOne({id: 'main-chat'}, (err, mainChatRoom) => {
                    if (err) throw  err;

                    let rooms = [];
                    rooms.push(mainChatRoom);
                    UserModel.findOne({id: message.from.id}, (err, item) => {
                        if (err) throw  err;

                        console.log('fromUser: ', item);

                        for (let i = 0; i < item.direct.length; i++) {
                            rooms.push(item.direct[i]);

                            if (item.direct[i].id === roomId) this.io.to(roomId).emit(`directMessagesRoomById=${roomId}from=${message.from.id}`, item.direct[i]);
                        }

                        console.log('rooms requestForAllChatRooms from: ', rooms);
                        socket.join(message.from.id);
                        this.io.to(message.from.id).emit('getAllChatRooms', rooms);
                    });
                });

                await ChatRoomModel.findOne({id: 'main-chat'}, (err, mainChatRoom) => {
                    if (err) throw  err;

                    let rooms = [];
                    rooms.push(mainChatRoom);

                    UserModel.findOne({id: message.to.id}, (err, item) => {
                        if (err) throw  err;

                        console.log('toUser: ', item);

                        for (let i = 0; i < item.direct.length; i++) {
                            rooms.push(item.direct[i]);

                            if (item.direct[i].id === roomId) this.io.to(roomId).emit(`directMessagesRoomById=${roomId}from=${message.to.id}`, item.direct[i]);
                        }

                        console.log('rooms requestForAllChatRooms to: ', rooms);
                        socket.join(message.to.id);
                        this.io.to(message.to.id).emit('getAllChatRooms', rooms);
                    });
                });
            });


            socket.on('userLogOut', async (userId: string) => {

                if (userId) {
                    const dateNow = new Date();

                    await UserModel.find(async (err, users) => {

                        if (err) throw err;

                        if (users) {
                            await UserModel.findOneAndUpdate({id: userId}, {online: false, lastSeen: dateNow}, (err, user) => {
                                if (err) throw  err;
                            });
                            console.log('users after log out: ', users);
                        }

                    });


                    await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {
                        if (err) throw err;

                        if (room.users) {
                            await ChatRoomModel.findOneAndUpdate({'id': 'main-chat', users: {$elemMatch: {id: userId}}},
                                {
                                    $set: {'users.$.online': false, 'users.$.lastSeen': dateNow}
                                }, (err, user) => {
                                    if (err) console.log('main chat user log out update error ', err);

                                    console.log('user main chat after log out update online: false: ', user);
                                });

                            await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {
                                if (err) throw  err;

                                room.getActiveUsers();

                                // await delete room.__v;

                                await room.save((err) => {
                                    if (err) throw err;
                                });

                                console.log('man chat room client log out', room);
                            });
                        }
                    });

                    socket.leave(userId);
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