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
import {Router} from "@angular/router";

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
  public isChatRoomActive: boolean;
  private mainChatRoomSubscribe: any;

  @ViewChild('messageList') messageList: ElementRef;
  @ViewChildren('messageListItem') messageListItem: QueryList<MatListItem>;

  constructor(private sharedService: SharedService,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private router: Router) {
  }

  ngOnInit(): void {

    this.isChatRoomActive = this.router.url.includes('main-chat') ||
      this.router.url.includes('room') ||
      this.router.url.includes('profile');

    this.sharedService.listenUser().pipe(take(1)).subscribe(param => {

      if (param) {
        this.onEditUser(param);
        if (param.paramAfter) {
          this.user = param.paramAfter;
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

    if (this.socketService.socket) this.socketService.sendRequestForMainChatRoom();

    this.mainChatRoomSubscribe = this.socketService.onMainChatRoom().pipe(take(1)).subscribe(mainChatRoom => {
      this.mainChatRoom = mainChatRoom;

      this.storage.set(this.mainChatRoomToken, JSON.stringify(this.mainChatRoom));
      console.log(this.mainChatRoom);
    }, (err) => {
      if (err) {
        this.mainChatRoom = JSON.parse(this.storage.get(this.mainChatRoomToken));
      }
    });

    console.log('main-chat-room: ',this.mainChatRoom);
  }

  private getUser() {
    if (!this.user && this.storage.has(currentUserToken)) {

      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);

      if (this.storage.has(this.userToken)) {
        this.user = JSON.parse(this.storage.get(this.userToken));
        console.log('user storage: ', this.user);
      }
    }

    this.socketService.onUser().subscribe((user: User) => {
      if (user && this.storage.has(currentUserToken)) {
        this.currentUserId = this.storage.get(currentUserToken);

        if (user.id === this.currentUserId) {
          this.user = user;
          console.log('user on: ', this.user);
          this.storage.set(this.userToken, JSON.stringify(this.user));
        }
      } else {
        this.user = user;
        console.log('user on: ', this.user);
        this.currentUserId = user.id;
        this.userToken = getUserStorageToken(user.id);
        this.storage.set(currentUserToken, this.currentUserId);
        this.storage.set(this.userToken, JSON.stringify(this.user));
        this.sharedService.editUser(this.user);
      }
    }, (err) => {
      if (err) {
        this.user = JSON.parse(this.storage.get(this.userToken));
      }
    });
    console.log('user: ', this.user);
  }

  sendMessage(messageContent: string): void {
    if (!messageContent || /^\s*$/.test(messageContent)) {
      return;
    }
    this.timeNow = new Date();
    this.user.action.sentMessage = true;
    this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage', null);
    this.socketService.sendMainChatMessage(this.message);
    this.sharedService.editUser(null);

    this.messageContent = null;

    console.log('sentMessage messages: ', this.messages);
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

    this.getChatRoom();
  }

  onEditUser(param): void {

    if (param !== null && param.paramBefore && param.paramAfter) {
      this.timeNow = new Date();
      this.user = param.paramAfter;
      this.user.action.edit = true;

      if (this.user.action.joined === true &&
        param.paramBefore.firstName !== this.user.firstName ||
        param.paramBefore.lastName !== this.user.lastName) {

        const messageContent = `${param.paramBefore.firstName} ${param.paramBefore.lastName} already is ${this.user.firstName} ${this.user.lastName}`;
        this.message = new Message(this.user, messageContent, this.timeNow, 'edit', null);
        this.sendNotification(this.message);
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

  activeChatRoom() {
    this.isChatRoomActive = true;
  }

  ngOnDestroy(): void {
    this.mainChatRoomSubscribe.unsubscribe();
  }
}
