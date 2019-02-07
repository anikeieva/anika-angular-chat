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
import {ClientChatRoom} from "./model/client-chat-room";


export class ChatServer {
    public static readonly PORT:number = 8084;
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

        this.io.on('connect', async (socket: any) => {
            console.log('Connected client on port %s.', this.port);


            // this.clearMongooseData();

            socket.on('requestForMainChatRoom', (async () => {

                await ChatRoomModel.findOne({id: 'main-chat'}, {messages: 0}, (err, room) => {
                    if (err) throw  err;

                    if (room) this.io.emit('mainChatRoom', room);
                });

            }));

            socket.on('requestForDirectMessagesRoomId', async (fromId, toId) => {

                    await ChatRoomModel.findOne({
                        from: fromId, to: toId
                    }, async (err, room) => {
                        if (err) throw  err;

                        socket.join(fromId);

                        if (room) {

                            if (room.id) this.io.to(fromId).emit('directMessagesRoomId', room.id);

                        } else {

                            const roomId = fromId * toId * Date.now();
                            console.log(roomId);

                            await UserModel.findOne({id: toId},{messages: 0, password: 0}, async (err, to) => {
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


                                    await UserModel.findOne({id: fromId}, {messages: 0, password: 0}, async (err, from) => {
                                        if (err) throw  err;

                                        if (from) {
                                            roomFrom.users.push(from, to);
                                            roomFrom.from = from.id;

                                            this.io.to(fromId).emit('directMessagesRoomId', roomFrom.id);

                                            const chatOptions = {
                                                new: true,
                                                upsert: true,
                                                setDefaultsOnInsert: true
                                            };

                                            await ChatRoomModel.findOneAndUpdate({id: roomId, from: from.id}, roomFrom, chatOptions, (err) => {
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

                                            await ChatRoomModel.findOneAndUpdate({id: roomId, from: to.id}, roomTo, chatOptions, (err) => {
                                                if (err) throw  err;
                                            });
                                        }
                                    });
                                }
                            });

                        }
                    });
            });

            socket.on('requestForDirectMessagesRoomById', (async (fromId, roomId) => {

                await ChatRoomModel.findOne({id: roomId, from: fromId}, {messages: 0}, async (err, room) => {
                    if (err) throw  err;

                    if (room) {
                        socket.join(roomId);
                        this.io.to(roomId).emit(`directMessagesRoomById=${roomId}from=${fromId}`, room);
                    }
                });
            }));

            socket.on('requestForUserById', (async (id) => {

                await UserModel.findOne({id: id}, {password: 0}, (err, user) => {
                    if (err) throw  err;

                    if (user) this.io.emit(`userById=${id}`, user);
                });
            }));

            socket.on('requestForAllChatRooms', (async (userId: string) => {

                await ChatRoomModel.find({$or: [{id: 'main-chat'},{from: userId}]}, {messages: 0}, async (err, rooms) => {
                    if (err) throw  err;

                    if (rooms) {
                        console.log('all rooms', rooms);
                        socket.join(userId);
                        this.io.to(userId).emit(`get=${userId}AllChatRooms`, rooms);
                    }
                });

            }));


            socket.on('directMessagesRoomNotification', (async (userId: string) => {

                socket.join(userId);
                this.io.to(userId).emit('directMessagesRoomNotification', 'message');

            }));

            socket.on('userLogInParam', async (userLogInParam: UserLogInParam) => {

                await UserModel.findOne({
                    login: userLogInParam.login,
                    password: userLogInParam.password
                }, {password: 0}, async (err, user) => {
                    if (err) throw  err;

                    if (user) {

                        user.online = true;

                        await user.save((err) => {
                            if (err) throw  err;
                        });

                        socket.join(user.id);
                        this.io.emit('userLogIn', 'userLogIn');
                        this.io.to(user.id).emit('user', user);

                        await ChatRoomModel.update({users: {$elemMatch: {id: user.id}}},
                            {
                                $set: {
                                    'users.$.online': user.online
                                }
                            },
                            {multi: true},
                            (err) => {
                                if (err) throw  err;
                            });

                        await ChatRoomModel.find({$or: [{id: 'main-chat'},{from: user.id}]}).cursor().eachAsync(async (room) => {
                           if (room) {
                               room.getActiveUsers();

                               await room.save((err) => {
                                   if (err) throw err;
                               });
                           }
                        });

                    } else {
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

                    } else {

                        await UserModel.findOne({login: user.login}, async (err, userWithItLogin) => {
                            if (err) throw err;

                            if (userWithItLogin) {

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

                                await newUser.save((err) => {
                                    if (err) throw err;
                                });


                                socket.join(newUser.id);
                                const clientUser = new ClientUser(newUser);

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
                            {
                                $set: {
                                    'users.$.firstName': user.firstName,
                                    'users.$.lastName': user.lastName,
                                    'users.$.gender': user.gender,
                                    'users.$.avatar': user.avatar,
                                    'users.$.action': user.action
                                }
                            }, (err) => {
                                if (err) console.log('main chat user update error ', err)
                            });

                        await ChatRoomModel.findOneAndUpdate({
                                'id': 'main-chat',
                                activeUsers: {$elemMatch: {id: user.id}}
                            },
                            {
                                $set: {
                                    'activeUsers.$.firstName': user.firstName,
                                    'activeUsers.$.lastName': user.lastName,
                                    'activeUsers.$.gender': user.gender,
                                    'activeUsers.$.avatar': user.avatar,
                                    'activeUsers.$.action': user.action
                                }
                            }, (err) => {
                                if (err) console.log('main chat activeUsers update error ', err)
                            });

                        await ChatRoomModel.findOne({'id': 'main-chat'}, (err, room) => {
                            this.io.emit('mainChatRoom', room);
                        });

                    } else {

                        room.users.push(user);
                        room.getActiveUsers();

                        console.log('room main-chat act', room);

                        await room.save((err) => {
                            if (err) throw err;
                        });

                        const clientRoom = new ClientChatRoom(room);
                        this.io.emit('mainChatRoom', clientRoom);
                    }
                });
            });


            socket.on('mainChatMessage', async (message: Message) => {

                await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {

                    if (err) console.log('main chat message err: ', err);

                    room.messages.push(message);
                    room.lastMessage = message.messageContent;

                    await room.save((err) => {
                        if (err) throw err;
                    });

                    this.io.emit('mainChatMessage', message);
                    this.io.emit('mainChatMessageNotification', 'message');
                });
            });

            await ChatRoomModel.findOne({id: 'main-chat'}, (err, room) => {
                if (err) throw  err;
                if (room) this.io.emit('mainChatMessages', room.messages);
            });

            socket.on('deleteMessage', (async (message_id: string, roomId: string, fromId: string) => {

                await ChatRoomModel.update({id: roomId, 'messages._id': message_id}, {
                        $pull: {
                            'messages': {'_id': message_id}
                        }
                }, {multi: true});


                await ChatRoomModel.findOne({id: roomId, from: {$in: [fromId, null]}}, async (err, room) => {
                    if (err) throw  err;

                    if (room) {
                        room.lastMessage = room.messages[room.messages.length - 1].messageContent;
                        await room.save((err) => {
                            if (err) throw err;
                        });
                        console.log(room);

                        if (room.type === 'chat') {
                            this.io.emit('mainChatMessages', room.messages);
                            this.io.emit('mainChatMessageNotification', 'message');
                        } else {
                            this.io.to(roomId).emit('directRoomMessages', room.messages);
                            socket.join(room.from);
                            this.io.to(room.from).emit('directMessagesRoomNotification', 'message');
                            socket.join(room.to);
                            this.io.to(room.to).emit('directMessagesRoomNotification', 'message');
                        }
                    }
                });
            }));

            socket.on('editMessage', (async (messageContent: string, message_id: string, roomId: string, fromId: string) => {

                const dateNow = new Date();

                await ChatRoomModel.update({id: roomId, 'messages._id': message_id}, {
                    $set: {
                        'messages.$.messageContent': messageContent,
                        'messages.$.edited': true,
                        'messages.$.sendingTime': dateNow
                    }
                }, {multi: true});


                await ChatRoomModel.findOne({id: roomId, from: {$in: [fromId, null]}}, async (err, room) => {
                    if (err) throw  err;

                    if (room) {
                        room.lastMessage = room.messages[room.messages.length - 1].messageContent;
                        await room.save((err) => {
                            if (err) throw err;
                        });
                        console.log('edit message room',room);

                        if (room.type === 'chat') {
                            this.io.emit('mainChatMessages', room.messages);
                            this.io.emit('mainChatMessageNotification', 'message');
                        } else {
                            this.io.to(roomId).emit('directRoomMessages', room.messages);
                            socket.join(room.from);
                            this.io.to(room.from).emit('directMessagesRoomNotification', 'message');
                            socket.join(room.to);
                            this.io.to(room.to).emit('directMessagesRoomNotification', 'message');
                        }
                    }
                });
            }));

            socket.on('directMessagesRoomMessage', async (message: Message, roomId: string) => {

                await ChatRoomModel.update({id: roomId}, {
                   $push: {
                       messages: message
                   },
                    $set: {
                        lastMessage: message.messageContent
                    }
                }, {multi: true});


                await ChatRoomModel.findOne({id: roomId, from: message.from.id}, async (err, room) => {
                    if (err) throw  err;

                    if (room) {
                        this.io.to(roomId).emit(`directMessagesRoomById=${roomId}from=${message.from.id}`, new ClientChatRoom(room));
                        this.io.to(roomId).emit('directRoomMessages', room.messages);
                    }

                    socket.join(message.from.id);
                    this.io.to(message.from.id).emit('directRoomMessage', message);

                    await ChatRoomModel.find({$or: [{id: 'main-chat'},{from: message.from.id}]}, {messages: 0}, async (err, rooms) => {
                        if (err) throw  err;
                        if (rooms) this.io.to(message.from.id).emit(`get=${message.from.id}AllChatRooms`, rooms);
                    });

                });

                await ChatRoomModel.findOne({id: roomId, from: message.to.id}, async (err, room) => {
                    if (err) throw  err;

                    if (room) {
                        this.io.to(roomId).emit(`directMessagesRoomById=${roomId}from=${message.to.id}`, new ClientChatRoom(room));
                        this.io.to(roomId).emit('directRoomMessages', room.messages);
                    }

                    socket.join(message.to.id);
                    this.io.to(message.to.id).emit('directRoomMessage', message);

                    await ChatRoomModel.find({$or: [{id: 'main-chat'},{from: message.to.id}]}, {messages: 0}, async (err, rooms) => {
                        if (err) throw  err;
                        if (rooms) this.io.to(message.to.id).emit(`get=${message.to.id}AllChatRooms`, rooms);
                    });

                });
            });

            socket.on('directRoomMessages', async (roomId: string) => {

                await ChatRoomModel.findOne({id: roomId}, async (err, room) => {
                    if (err) throw  err;

                    if (room) {
                        socket.join(roomId);
                        this.io.to(roomId).emit('directRoomMessages', room.messages);
                    }
                });
            });


            socket.on('userLogOut', async (userId: string) => {

                if (userId) {
                    const dateNow = new Date();

                    await UserModel.find(async (err, users) => {

                        if (err) throw err;

                        if (users) {
                            await UserModel.findOneAndUpdate({id: userId}, {
                                online: false,
                                lastSeen: dateNow
                            }, (err) => {
                                if (err) throw  err;
                            });
                        }

                    });

                    await ChatRoomModel.update({'users.id': userId},
                        {
                            $set: {
                                'users.$.online': false,
                                'user.$.lastSeen': dateNow
                            }
                        },
                        {multi: true},
                        (err) => {
                            if (err) throw  err;
                        });

                    await ChatRoomModel.find({$or: [{id: 'main-chat'},{from: userId}]}).cursor().eachAsync(async (room) => {
                        if (room) {
                            room.getActiveUsers();

                            console.log('room get active users', room);

                            await room.save((err) => {
                                if (err) throw err;
                            });
                        }
                    });

                    await ChatRoomModel.findOne({id: 'main-chat'}, async (err, room) => {
                        if (err) throw  err;

                        const clientRoom = new ClientChatRoom(room);
                        this.io.emit('mainChatRoom', clientRoom);
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