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
import {currentUserToken} from "../../shared/model/getStorageToken";
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
  private currentUserId: string;
  private directMessagesRoomId: string;

  @ViewChild('messageList') messageList: ElementRef;
  @ViewChildren('messageListItem') messageListItem: QueryList<MatListItem>;


  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {}

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
    this.currentUserId = this.storage.get(currentUserToken);

    if (!this.socketService.socket) this.socketService.initSocket();

    if (this.currentUserId) this.socketService.sendRequestForUserById(this.currentUserId);

    this.socketService.onUserById(this.currentUserId).subscribe((user: User) => {
      if (user) this.user = user;
    });


    this.socketService.onUser().subscribe((user: User) => {
      if (user.id === this.currentUserId) {
        this.user = user;
      } else {
        this.user = user;
        this.currentUserId = user.id;
        this.storage.set(currentUserToken, this.currentUserId);
      }

    });
  }

  private getDirectRoomUser(directUserId): void {
    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendRequestForUserById(directUserId);

    this.socketService.onUserById(directUserId).pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.directRoomUser = user;
      }
    });
  }

  getDirectRoom() {
    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendRequestForDirectMessagesRoomById(this.currentUserId, this.directMessagesRoomId);

    this.socketService.onDirectMessagesRoomById(this.currentUserId, this.directMessagesRoomId).subscribe(room => {
      this.directMessagesRoom = room;
      this.getDirectRoomUser(room.to);
    });
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
