import {
  AfterViewInit,
  Component,
  ElementRef, Inject, OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {User} from '../../shared/model/user';
import {SharedService} from '../../shared/servises/shared.service';
import {Message} from '../../shared/model/message';
import {SocketService} from "../../shared/servises/socket.service";
import {MatListItem} from "@angular/material";
import {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {ChatRoom} from "../../shared/model/chat-room";
import {getChatRoomStorageToken, getUserStorageToken} from "../../shared/model/getStorageToken";
import {currentUserToken} from "../../shared/model/getStorageToken";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit, AfterViewInit, OnDestroy {

  public messageContent: string;
  public messages: Message[];
  private message: Message;
  public user: User;
  public timeNow: Date;
  public mainChatRoom: ChatRoom;
  public mainChatRoomToken: string;
  public userToken: string;
  public currentUserId: string;

  @ViewChild('messageList') messageList: ElementRef;
  @ViewChildren('messageListItem') messageListItem: QueryList<MatListItem>;

  constructor(private sharedService: SharedService,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {
  }

  ngOnInit(): void {
    this.sharedService.listenUser().pipe(take(1)).subscribe(param => {
      console.log('param: ', param);
      if (param) {
        this.onEditUser(param);
        if (param.paramAfter) {
          this.user = param.paramAfter;
          console.log(this.user);
        }
        if (param.id) {
          this.user = param;
        }
      } else {
        this.getUser();
      }
    });

    this.getUser();
    this.getChatRoom();
    this.initIoConnection();
    this.socketService.onMainChatMessages().subscribe((messages) => this.messages = messages);
    console.log('init messages: ',this.messages);
  }

  ngAfterViewInit(): void {
    this.messageListItem.changes.subscribe(elements => {
      this.scrollToBottom();
    });
  }

  private scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    this.socketService.onMainChatMessage()
      .subscribe((message: Message) => {
        this.messages.push(message);
      });
  }

  getChatRoom() {
    console.log('main-chat room', this.mainChatRoom);
    this.mainChatRoomToken = getChatRoomStorageToken('main-chat');

    if (this.socketService.socket) {
      this.socketService.sendRequestForMainChatRoom();
    }

    this.socketService.onMainChatRoom().subscribe(mainChatRoom => {
      this.mainChatRoom = mainChatRoom;

      this.storage.set(this.mainChatRoomToken, JSON.stringify(this.mainChatRoom));
      console.log(this.mainChatRoom);
    }, (err) => {
      if (err) {
        this.mainChatRoom = JSON.parse(this.storage.get(this.mainChatRoomToken));
      }
    });

    console.log(this.mainChatRoom);
  }

  private getUser() {
    if (!this.user && this.storage.has(currentUserToken)) {

      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);

      if (this.storage.has(this.userToken)) {
        this.user = JSON.parse(this.storage.get(this.userToken));
        console.log('user: ', this.user);
      }
    }

    this.socketService.onUser().subscribe((user: User) => {

      this.user = user;
      this.currentUserId = user.id;
      this.userToken = getUserStorageToken(user.id);
      this.storage.set(currentUserToken, this.currentUserId);
      this.storage.set(this.userToken, JSON.stringify(this.user));
      this.sharedService.setUser(user);
    }, (err) => {
      if (err) {
        this.user = JSON.parse(this.storage.get(this.userToken));
      }
    });
    console.log('user: ', this.user);
  }

  sendMessage(messageContent: string): void {
    if (!messageContent) {
      return;
    }

    this.timeNow = new Date();
    this.user.action.sentMessage = true;
    this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage', null);
    this.socketService.sendMainChatMessage(this.message);
    this.socketService.sendRequestForAllChatRooms(this.user);
    this.sharedService.editUser(null);

    this.messageContent = null;

    console.log('sentMessage messages: ',this.messages);

    console.log('mainChatRoom: ', this.mainChatRoom);
  }

  onJoin(): void {
    this.user.action.joined = true;
    this.storage.set(this.userToken, JSON.stringify(this.user));
    this.socketService.initSocket();
    this.socketService.sendUser(this.user);
    this.socketService.sendMainChatUser(this.user);

    this.timeNow = new Date();
    this.message = new Message(this.user, `${this.user.firstName} ${this.user.lastName} joined to conversation`, this.timeNow, 'joined', null);
    this.sendNotification(this.message);
    console.log('join messages: ',this.messages);

    this.getChatRoom();
    console.log(this.mainChatRoom);
  }

  onEditUser(param): void {

    console.log(param);

    if (param !== null && param.paramBefore && param.paramAfter) {
      console.log('after: ', param.paramAfter);
      console.log('user: ' ,this.user);

      this.timeNow = new Date();
      this.user = param.paramAfter;
      console.log('user: ' , this.user);
      this.user.action.edit = true;

      if (this.user.action.joined === true &&
        param.paramBefore.firstName !== this.user.firstName ||
        param.paramBefore.lastName !== this.user.lastName) {

        console.log(this.user);

        const messageContent = `${param.paramBefore.firstName} ${param.paramBefore.lastName} already is ${this.user.firstName} ${this.user.lastName}`;
        this.message = new Message(this.user, messageContent, this.timeNow, 'edit', null);
        console.log(this.message);
        this.sendNotification(this.message);
        console.log('edit messages: ',this.messages);
      }

      this.sharedService.editUserClear();
    }
  }

  sendNotification(message): void {
    this.socketService.sendMainChatMessage(message);
  }

  getClassOfMessageList(message, user) {
    if (message.action === 'sentMessage') {
      if (message.from.id === user.id) {
        return 'message-item message-list-item__current-user';
      }
      return 'message-item';
    }
    return 'action-item';
  }

  ngOnDestroy(): void {
  }
}
