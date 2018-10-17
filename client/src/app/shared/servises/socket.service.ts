import {Injectable} from '@angular/core';

import * as socketIo from 'socket.io-client'
import {Message} from "../model/message";
import {Observable} from "rxjs";
import {User} from "../model/user";

const SERVER_URL = 'http://localhost:8080';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket;

  constructor() { }

  public initSocket(): void {
    this.socket = socketIo(SERVER_URL);
  }

  public send(message: Message): void {
    this.socket.emit('message', message);
  }

  public onMessage(): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socket.on('message', (data: Message) => observer.next(data));
    });
  }

  public onMessages(): Observable<Message[]> {
    return new Observable<Message[]>( observer => {
      this.socket.on('messages', (messages: Array<Message>) => {
        observer.next(messages);
      });
    });
  }

  public sendUser(user: User): void {
    this.socket.emit('user', user);
  }

  public onUser(): Observable<User> {
    return new Observable<User>(observer => {
      this.socket.on('user', (user: User) => observer.next(user));
    })
  }
}
