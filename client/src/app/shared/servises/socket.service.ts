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

  public sendMainChatMessage(message: Message): void {
    this.socket.emit('mainChatMessage', message);
  }

  public onMainChatMessage(): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socket.on('mainChatMessage', (data: Message) => observer.next(data));
    });
  }

  public onMainChatMessages(): Observable<Message[]> {
    return new Observable<Message[]>( observer => {
      this.socket.on('mainChatMessages', (messages: Array<Message>) => {
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

  public sendMainChatUser(user: User): void {
    this.socket.emit('mainChatUser', user);
  }

  public onMainChatUser(): Observable<User> {
    return new Observable<User>(observer => {
      this.socket.on('mainChatUser', (user: User) => observer.next(user));
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

  public sendUserLogOut(user: User): void {
    this.socket.emit('userLogOut', user);
  }

  public sendRequestForUserById(id): void {
    this.socket.emit('requestForUserById', id);
  }

  public onUserById(): Observable<User> {
    return new Observable<User>(observer => {
      this.socket.on('userById', (user: User) => observer.next(user));
    })
  }

  public sendRequestForDirectMessagesRoom(fromId: string, toId: string): void {
    this.socket.emit('requestForDirectMessagesRoom', fromId, toId);
  }

  public sendRequestForDirectMessagesRoomById(id: string, from: User): void {
    this.socket.emit('requestForDirectMessagesRoomById', id, from);
  }

  public onDirectMessagesRoom(): Observable<ChatRoom> {
    return new Observable<ChatRoom>(observer => {
      this.socket.on('directMessagesRoom', (directMessagesRoom: ChatRoom) => observer.next(directMessagesRoom));
    })
  }

  public onGetAllChatRooms(): Observable<ChatRoom[]> {
    return new Observable<ChatRoom[]>(observer => {
      this.socket.on('getAllChatRooms', (rooms: ChatRoom[]) => observer.next(rooms));
    })
  }

  public sendRequestForAllChatRooms(user: User): void {
    this.socket.emit('requestForAllChatRooms', user);
  }

  public sendDirectMessagesRoomMessage(message: Message, to: User): void {
    this.socket.emit('directMessagesRoomMessage', message, to);
  }

  // public onDirectMessagesRoomMessage(): Observable<Message> {
  //   return new Observable<Message>(observer => {
  //     this.socket.on('directMessagesRoomMessage', (data: Message) => observer.next(data));
  //   });
  // }
  //
  public onDirectMessagesRoomMessages(): Observable<Message[]> {
    return new Observable<Message[]>( observer => {
      this.socket.on('directMessagesRoomMessages', (messages: Array<Message>) => {
        observer.next(messages);
      });
    });
  }
}
