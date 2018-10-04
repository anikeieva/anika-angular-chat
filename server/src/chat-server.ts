import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as fs from 'fs';

import { Message } from './model';

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    public messages: Array<Message>;

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

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
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