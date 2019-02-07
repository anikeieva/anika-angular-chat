import {Injectable} from '@angular/core';

import * as socketIo from 'socket.io-client'
import {Message} from "../model/message";
import {Observable} from "rxjs";
import {User} from "../model/user";
import {UserLogInParam} from "../model/userLogInParam";
import {ChatRoom} from "../model/chat-room";

// const SERVER_URL = 'http://192.168.88.112:8082';
const SERVER_URL = '31.43.112.244:4000';
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

  public onMainChatMessageNotification(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('mainChatMessageNotification', (data: string) => observer.next(data));
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

  public sendUserLogInParam (userLogInParam: UserLogInParam): void {
    this.socket.emit('userLogInParam', userLogInParam);
  }

  public onUserLogIn(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('userLogIn', (userLogIn: string) => observer.next(userLogIn));
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

  public sendUserLogOut(userId: string): void {
    this.socket.emit('userLogOut', userId);
  }

  public sendRequestForUserById(id): void {
    this.socket.emit('requestForUserById', id);
  }

  public onUserById(userId): Observable<User> {
    return new Observable<User>(observer => {
      this.socket.on(`userById=${userId}`, (user: User) => observer.next(user));
    })
  }

  public sendRequestForDirectMessagesRoomId(fromId: string, toId: string): void {
    this.socket.emit('requestForDirectMessagesRoomId', fromId, toId);
  }

  public sendRequestForDirectMessagesRoomById(fromId: string, roomId: string): void {
    this.socket.emit('requestForDirectMessagesRoomById', fromId, roomId);
  }

  public onDirectMessagesRoomId(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('directMessagesRoomId', (roomId: string) => observer.next(roomId));
    })
  }

  public onDirectMessagesRoomById(fromId: string, roomId: string): Observable<ChatRoom> {
    return new Observable<ChatRoom>(observer => {
      this.socket.on(`directMessagesRoomById=${roomId}from=${fromId}`, (directMessagesRoom: ChatRoom) => observer.next(directMessagesRoom));
    })
  }

  public onGetAllChatRooms(userId): Observable<ChatRoom[]> {
    return new Observable<ChatRoom[]>(observer => {
      this.socket.on(`get=${userId}AllChatRooms`, (rooms: ChatRoom[]) => observer.next(rooms));
    })
  }

  public sendRequestForAllChatRooms(userId: string): void {
    this.socket.emit('requestForAllChatRooms', userId);
  }

  public sendDirectMessagesRoomMessage(message: Message, roomId: string): void {
    this.socket.emit('directMessagesRoomMessage', message, roomId);
  }

  public sendDirectMessagesRoomNotification(userId): void {
    this.socket.emit('directMessagesRoomNotification',userId);
  }

  public onDirectMessagesRoomNotification(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('directMessagesRoomNotification', (data: string) => observer.next(data));
    });
  }

  public onDirectRoomMessages(): Observable<Message[]> {
    return new Observable<Message[]>(observer => {
      this.socket.on('directRoomMessages', (data: Message[]) => observer.next(data));
    });
  }

  public onDirectRoomMessage(): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socket.on('directRoomMessage', (data: Message) => observer.next(data));
    });
  }

  public onUserNotSignUp(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('userNotSignUp', (userNotSignUp: string) => observer.next(userNotSignUp));
    })
  }

  public onUserSignUp(): Observable<User> {
    return new Observable<User>(observer => {
      this.socket.on('userSignUp', (user: User) => observer.next(user));
    })
  }

  public sendRequestForDirectRoomMessages(roomId: string): void {
    this.socket.emit('directRoomMessages', roomId);
  }

  deleteMessage(message_id: string, roomId: string, fromId: string): void {
    this.socket.emit('deleteMessage', message_id, roomId, fromId);
  }
}
