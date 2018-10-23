import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as fs from 'fs';

import { Message } from './model';
import {User} from "../../client/src/app/shared/model/user";

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    public messages: Array<Message>;
    public users: Array<User>;

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
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

    private listen(): void {

        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        fs.readFile('data/messages.json', (err, data) => {
           if (err) {
               if (err.code === 'ENOENT') {
                   this.messages = [];
               } else {
                   throw err;
               }

           } else {
               this.messages = JSON.parse(data.toString());
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

            socket.on('user', (user: User) => {

                console.log('user.id', user.id);
                console.log('change id: ', this.users.some(item => item.id === user.id ));

               if (this.users.some(item => item.id === user.id )) {
                   this.users.forEach((item, i, users) => {
                      if (item.id === user.id) {
                          users.splice(i, 1, user);
                      }
                   });
               } else {
                   this.users.push(user);
                   user.id = this.users.length - 1;
               }

               console.log('USERS: ', this.users);

                fs.writeFile('data/users.json', JSON.stringify(this.users), (err) => {
                    if (err) throw err;
                    console.log('User written to users.json');
                });

                this.io.emit('user', user);
            });

            socket.on('message', (m: Message) => {
                this.messages.push(m);

                fs.writeFile('data/messages.json', JSON.stringify(this.messages), (err) => {
                    if (err) throw err;
                    console.log('Messages written to messages.json');
                });

                console.log('[server](message): %s', JSON.stringify(m));
                this.io.emit('message', m);
            });

            this.io.emit('messages', this.messages);

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}