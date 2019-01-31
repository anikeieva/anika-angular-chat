import {
  AfterViewInit,
  Component, ElementRef, Inject,
  OnInit, QueryList, ViewChild, ViewChildren,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";
import {Message} from "../../shared/model/message";
import {ChatRoom} from "../../shared/model/chat-room";
import {MatListItem} from "@angular/material";
import {currentUserToken, getChatRoomStorageToken, getUserStorageToken} from "../../shared/model/getStorageToken";
import {SharedService} from "../../shared/servises/shared.service";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-direct-messages-room',
  templateUrl: './direct-messages-room.component.html',
  styleUrls: ['./direct-messages-room.component.css']
})
export class DirectMessagesRoomComponent implements OnInit, AfterViewInit {

  directRoomUser: User;
  user: User;
  messageContent: string;
  messages: Message[];
  message: Message;
  timeNow: Date;
  directMessagesRoom: ChatRoom;
  chatRoomToken: string;
  userToken: string;
  directRoomUserToken: string;
  private currentUserId: string;
  private directMessagesRoomId: string;

  @ViewChild('messageList') messageList: ElementRef;
  @ViewChildren('messageListItem') messageListItem: QueryList<MatListItem>;


  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private sharedService: SharedService) {}

  ngOnInit() {
    this.getUser();

    this.route.queryParams.subscribe(param => {

      this.directMessagesRoomId = param.id;
      this.getDirectRoom();
    });

    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendRequestForDirectRoomMessages(this.directMessagesRoomId);

    this.socketService.onDirectRoomMessages().subscribe((messages: Message[]) => {
      if (messages) this.messages = messages;
    });
  }

  getUser() {
    if (this.storage.has(currentUserToken)) {
      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);

      if (!this.user && this.storage.has(this.userToken)) {
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
          this.sharedService.editUser(this.user);
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
        this.userToken = getUserStorageToken(this.currentUserId);
        this.user = JSON.parse(this.storage.get(this.userToken));
      }
    });
    console.log('user: ', this.user);
  }

  private getDirectRoomUser(directUserId): void {
    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendRequestForUserById(directUserId);

    this.socketService.onUserById(directUserId).pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.directRoomUser = user;
        console.log('direct room user: ',this.directRoomUser);
        this.storage.set(this.directRoomUserToken, JSON.stringify(this.directRoomUser));
      }
    }, (err) => {
      if (err) {
        this.directRoomUser = JSON.parse(this.storage.get(this.directRoomUserToken));
        console.log('direct room user err: ',this.directRoomUser);
      }
    });
    console.log('direct room user: ',this.directRoomUser);
  }

  getDirectRoom() {
    this.chatRoomToken = getChatRoomStorageToken(this.directMessagesRoomId);

    if (!this.socketService.socket) this.socketService.initSocket();
    console.log(this.socketService.socket);

    this.socketService.sendRequestForDirectMessagesRoomById(this.user.id, this.directMessagesRoomId);

    this.socketService.onDirectMessagesRoomById(this.user.id, this.directMessagesRoomId).subscribe(room => {

      this.directMessagesRoom = room;
      console.log('room', room);
      this.storage.set(this.chatRoomToken, JSON.stringify(this.directMessagesRoom));
      this.getDirectRoomUser(room.to);

    }, (err) => {
      if (err) {
        this.directMessagesRoom = JSON.parse(this.storage.get(this.chatRoomToken));
      }
    });
    console.log('directRoom', this.directMessagesRoom);
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

  sendMessage(messageContent: string): void {

    if (!messageContent || /^\s*$/.test(messageContent)) {
      return;
    }
    this.timeNow = new Date();
    this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage', this.directRoomUser);
    if (!this.socketService.socket) this.socketService.initSocket();
    this.socketService.sendDirectMessagesRoomMessage(this.message, this.directMessagesRoom.id);
    this.messageContent = null;
  }
}
