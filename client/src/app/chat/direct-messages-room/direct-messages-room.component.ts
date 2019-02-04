import {
  AfterViewChecked,
  AfterViewInit,
  Component, ElementRef, Inject,
  OnInit, QueryList, Renderer2, ViewChild, ViewChildren,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";
import {Message} from "../../shared/model/message";
import {ChatRoom} from "../../shared/model/chat-room";
import {MatListItem} from "@angular/material";
import {
  currentDirectUserToken,
  currentUserToken,
  getUserStorageToken
} from "../../shared/model/getStorageToken";
import {SharedService} from "../../shared/servises/shared.service";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-direct-messages-room',
  templateUrl: './direct-messages-room.component.html',
  styleUrls: ['./direct-messages-room.component.css']
})
export class DirectMessagesRoomComponent implements OnInit, AfterViewInit, AfterViewChecked {

  directRoomUser: User;
  user: User;
  messageContent: string;
  messages: Message[];
  message: Message;
  timeNow: Date;
  directMessagesRoom: ChatRoom;
  userToken: string;
  directRoomUserToken: string;
  private currentUserId: string;
  private directMessagesRoomId: string;
  directRoomUserId: string;
  directRoomUserIdToken: string;

  @ViewChild('messageList') messageList: ElementRef;
  @ViewChildren('messageListItem') messageListItem: QueryList<MatListItem>;
  @ViewChild('chat_room_footer') chatRoomFooter: ElementRef;
  @ViewChild('chat_room_content') chatRoomContent: ElementRef;


  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private sharedService: SharedService,
              private renderer: Renderer2) {}

  ngOnInit() {
    this.directRoomUserIdToken = currentDirectUserToken;

    if (this.storage.has(this.directRoomUserIdToken)) {
      this.directRoomUserId = this.storage.get(this.directRoomUserIdToken);
      this.directRoomUserToken = getUserStorageToken(this.directRoomUserId);
      this.directRoomUser = JSON.parse(this.storage.get(this.directRoomUserToken));
    }
    this.getUser();

    this.route.queryParams.subscribe(param => {

      this.directMessagesRoomId = param.id;

      if (!this.socketService.socket) this.socketService.initSocket();

      this.socketService.sendRequestForDirectRoomMessages(this.directMessagesRoomId);

      this.socketService.onDirectRoomMessages().subscribe((messages: Message[]) => {
        if (messages) this.messages = messages;
      });

      this.getDirectRoom();
    });

  }

  getUser() {
    if (this.storage.has(currentUserToken)) {
      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);

      if (!this.user && this.storage.has(this.userToken)) {
        this.user = JSON.parse(this.storage.get(this.userToken));
      }
    }

    this.socketService.onUser().subscribe((user: User) => {

      if (user && this.storage.has(currentUserToken)) {
        this.currentUserId = this.storage.get(currentUserToken);

        if (user.id === this.currentUserId) {
          this.user = user;
          this.storage.set(this.userToken, JSON.stringify(this.user));
          this.sharedService.editUser(this.user);
        }
      } else {
        this.user = user;
        this.currentUserId = user.id;
        this.userToken = getUserStorageToken(user.id);
        this.storage.set(currentUserToken, this.currentUserId);
        this.storage.set(this.userToken, JSON.stringify(this.user));
        this.sharedService.editUser(this.user);
      }
    });
  }

  private getDirectRoomUser(directUserId): void {
    this.directRoomUserIdToken = currentDirectUserToken;
    this.directRoomUserId = directUserId;
    this.storage.set(this.directRoomUserIdToken, this.directRoomUserId);
    this.directRoomUserToken = getUserStorageToken(directUserId);

    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendRequestForUserById(directUserId);

    this.socketService.onUserById(directUserId).pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.directRoomUser = user;
        this.storage.set(this.directRoomUserToken, JSON.stringify(user));
      }
    });
  }

  getDirectRoom() {

    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendRequestForDirectMessagesRoomById(this.user.id, this.directMessagesRoomId);

    this.socketService.onDirectMessagesRoomById(this.user.id, this.directMessagesRoomId).subscribe(room => {

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

  ngAfterViewChecked() {
    const chatRoomFooterHeight = this.chatRoomFooter.nativeElement.offsetHeight + 10;
    const chatRoomContentHeight = `calc(100% - 70px - ${chatRoomFooterHeight}px)`;
    this.renderer.setStyle(this.chatRoomContent.nativeElement, 'height', chatRoomContentHeight);
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
