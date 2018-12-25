import {
  AfterViewInit,
  Component, ElementRef, Inject, InjectionToken,
  OnInit, QueryList, ViewChild, ViewChildren,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "angular-webstorage-service";
import {Message} from "../../shared/model/message";
import {ChatRoom} from "../../shared/model/chat-room";
import {MatListItem} from "@angular/material";
import {getChatRoomStorageToken, getUserStorageToken} from "../../shared/model/getStorageToken";
import {SharedService} from "../../shared/servises/shared.service";

@Component({
  selector: 'app-direct-messages-room',
  templateUrl: './direct-messages-room.component.html',
  styleUrls: ['./direct-messages-room.component.css']
})
export class DirectMessagesRoomComponent implements OnInit, AfterViewInit {

  public directRoomUser: User;
  public user: User;
  public roomId: string;
  public messageContent: string;
  public messages: Message[];
  private message: Message;
  public timeNow: Date;
  public directMessagesRoom: ChatRoom;
  public chatRoomToken: string;
  public userToken: string;
  public directRoomUserToken: string;

  @ViewChild('messageList') messageList: ElementRef;
  @ViewChildren('messageListItem') messageListItem: QueryList<MatListItem>;

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private sharedService: SharedService) {}

  ngOnInit() {
    this.socketService.initSocket();
    this.getAllUsers();
    this.getChatRoom();
  }

  private getDirectRoomUser(): void {
    this.route.queryParams.subscribe(param => {
      this.roomId = `${param.from}${param.to}`;//soon it will be on server
      this.directRoomUserToken = getUserStorageToken(param.to);

      if (this.socketService.socket) {
        this.socketService.sendRequestForUserById(param.to);
      }

      this.socketService.onUserById().subscribe((user: User) => {
        if (user) {
          this.directRoomUser = user;
          this.storage.set(this.directRoomUserToken, this.directRoomUser);
          console.log('direct room user: ',this.directRoomUser);
        }
      }, (err) => {
        if (err) {
          this.directRoomUser = this.storage.get(this.directRoomUserToken);
          console.log('direct room user: ',this.directRoomUser);
        }
      });
    });

    console.log('direct room user: ',this.directRoomUser);
  }

  getUser() {
    this.sharedService.getUser().subscribe(user => this.user = user);

    if (!this.user) {
      this.user = this.storage.get(this.userToken);
    }

    this.socketService.onUser().subscribe((user: User) => {
      this.user = user;
      this.userToken = getUserStorageToken(this.user.id);
      this.storage.set(this.userToken, this.user);
      this.sharedService.setUser(user);
    }, (err) => {
      if (err) {
        this.user = this.storage.get(this.userToken);
      }
    });

    this.storage.set(this.userToken, this.user);
    console.log('user: ', this.user);
  }

  getAllUsers() {
    this.getUser();

    this.getDirectRoomUser();
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

  getChatRoom() {
    this.chatRoomToken = getChatRoomStorageToken(this.roomId);

    if (this.socketService.socket) {
      this.socketService.sendRequestForDirectMessagesRoom(this.user ,this.roomId);
    }

    this.socketService.onDirectMessagesRoom().subscribe(room => {
      this.directMessagesRoom = room;
      this.messages = room.messages;
      console.log('socket in messages: ',this.messages);

      this.storage.set(this.chatRoomToken, this.directMessagesRoom);
      console.log(this.directMessagesRoom);
    }, (err) => {
      if (err) {
        this.directMessagesRoom = this.storage.get(this.chatRoomToken);
      }
    });

    console.log(this.directMessagesRoom);
  }

  sendMessage(messageContent: string): void {
    if (!messageContent) {
      return;
    }

    this.timeNow = new Date();
    console.log('this.user', this.user);
    this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage');
    this.socketService.sendDirectMessagesRoomMessage(this.message, this.directRoomUser);
    this.getChatRoom();

    console.log('messages: ',this.messages);

    this.messageContent = null;

    console.log('sentMessage messages: ',this.messages);

    console.log('mainChatRoom: ', this.directMessagesRoom);
  }
}
