import {Injectable} from '@angular/core';

import * as socketIo from 'socket.io-client'
import {Message} from "../model/message";
import {Observable} from "rxjs";
import {User} from "../model/user";
import {UserLogInParam} from "../model/userLogInParam";
import {ChatRoom} from "../model/chat-room";

const SERVER_URL = 'http://localhost:8080';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  public socket;

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

  public sendUserLogInParam (userLogInParam: UserLogInParam): void {
    this.socket.emit('userLogInParam', userLogInParam);
  }

  public onUserLogIn(): Observable<User> {
    return new Observable<User>(observer => {
      this.socket.on('userLogIn', (user: User) => observer.next(user));
    })
  }

  public onUserNotLogIn(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('userNotLogIn', (userNotLogIn: string) => observer.next(userNotLogIn));
    })
  }

  public sendRequestForMainChatRoom(): void {
    this.socket.emit('requestForMainChatRoom');
  }

  public onMainChatRoom(): Observable<ChatRoom> {
    return new Observable<ChatRoom>(observer => {
      this.socket.on('mainChatRoom', (mainChatRoom: ChatRoom) => observer.next(mainChatRoom));
    })
  }
}
