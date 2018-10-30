import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as fs from 'fs';

import {Message} from './model';
import {User} from "./model/user";
import {UserLogInParam} from "./model/userLogInParam";
import {ChatRoom, IChatRoomOptions} from "./model/chat-room";
import {TypeChatRooms} from "./model/type-chat-rooms";

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    public users: Array<User>;
    public mainChatRoom: ChatRoom;

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
        this.createChatRoom();
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
        const opt: IChatRoomOptions = {
            id: 'main-chat',
            name: 'Main chat',
            avatar: 'src/app/images/chat/chat.png',
            type: TypeChatRooms.chat,
            lastMessage: 'online chat',
            users: [],
            activeUsers: [],
            messages: []
        };
        this.mainChatRoom = new ChatRoom(opt);
    }

    private listen(): void {

        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        fs.readFile('data/main-chat-room.json', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    this.createChatRoom();
                } else {
                    throw err;
                }

            } else {
                this.mainChatRoom = JSON.parse(data.toString());
            }
        });

        fs.readFile('data/users.json', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    this.users = [];
                } else {
                    throw err;
                }

            } else {
                this.users = JSON.parse(data.toString());
            }
        });


        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);

            socket.on('requestForMainChatRoom', ( () => {
                this.io.emit('mainChatRoom', this.mainChatRoom);
            }));

            socket.on('userLogInParam', (userLogInParam: UserLogInParam) => {

                let user: User;

                if (this.users.some(item => item.login === userLogInParam.login && item.password === userLogInParam.password )) {

                    this.users.forEach((item) => {
                        if (item.login === userLogInParam.login && item.password === userLogInParam.password) {
                            user = item;
                            user.online = true;
                        }
                    });
                }

                if (user) {
                    console.log('User log in: ', user);
                    this.io.emit('userLogIn', user);
                    this.io.emit('user', user);
                } else {
                    console.log('User not log in!');
                    this.io.emit('userNotLogIn', 'userNotLogIn');
                }
            });

            socket.on('user', (user: User) => {

               if (this.users.some(item => item.id === user.id )) {
                   this.users.forEach((item, i, users) => {
                      if (item.id === user.id) {
                          users.splice(i, 1, user);
                      }
                   });
               } else {
                   this.users.push(user);
                   user.id = this.users.length;
               }

               console.log('USERS: ', this.users);

                fs.writeFile('data/users.json', JSON.stringify(this.users), (err) => {
                    if (err) throw err;
                    console.log('User written to users.json');
                });

                this.io.emit('user', user);
            });

            socket.on('mainChatUser', (user: User) => {

                if (this.mainChatRoom.users.some(item => item.id === user.id )) {
                    this.mainChatRoom.users.forEach((item, i, users) => {
                        if (item.id === user.id) {
                            users.splice(i, 1, user);
                        }
                    });
                } else {
                    this.mainChatRoom.users.push(user);

                    if (user.online) {
                        this.mainChatRoom.activeUsers.push(user);
                    }
                }


                if (this.mainChatRoom.users.some(item => !item.online )) {
                    this.mainChatRoom.activeUsers = this.mainChatRoom.users.filter(item => item.online);
                }

                console.log('USERS: ', this.mainChatRoom.users);
                console.log('num of users in main chat', this.mainChatRoom.users.length);
                console.log('num of active users in main chat', this.mainChatRoom.activeUsers.length);

                fs.writeFile('data/main-chat-room.json', JSON.stringify(this.mainChatRoom), (err) => {
                    if (err) throw err;
                    console.log('User written to main-chat-room.json');
                });

            });

            socket.on('mainChatMessage', (m: Message) => {
                this.mainChatRoom.messages.push(m);

                fs.writeFile('data/main-chat-room.json', JSON.stringify(this.mainChatRoom), (err) => {
                    if (err) throw err;
                    console.log('Messages written to main-chat-room.json');
                });

                console.log('[server](message): %s', JSON.stringify(m));
                this.io.emit('mainChatMessage', m);
            });

            this.io.emit('mainChatMessages', this.mainChatRoom.messages);

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}