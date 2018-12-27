import {
  AfterViewInit,
  Component, ElementRef, Inject,
  OnInit, QueryList, ViewChild, ViewChildren,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "angular-webstorage-service";
import {Message} from "../../shared/model/message";
import {ChatRoom} from "../../shared/model/chat-room";
import {MatListItem} from "@angular/material";
import {currentUserToken, getChatRoomStorageToken, getUserStorageToken} from "../../shared/model/getStorageToken";
import {SharedService} from "../../shared/servises/shared.service";

@Component({
  selector: 'app-direct-messages-room',
  templateUrl: './direct-messages-room.component.html',
  styleUrls: ['./direct-messages-room.component.css']
})
export class DirectMessagesRoomComponent implements OnInit, AfterViewInit {

  public directRoomUser: User;
  public user: User;
  public messageContent: string;
  public messages: Message[];
  private message: Message;
  public timeNow: Date;
  public directMessagesRoom: ChatRoom;
  public chatRoomToken: string;
  public userToken: string;
  public directRoomUserToken: string;
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
      console.log(this.directMessagesRoomId);
      this.getDirectRoom();
    });
  }

  getUser() {
    this.currentUserId = this.storage.get(currentUserToken);

    if (!this.user) {
      this.userToken = getUserStorageToken(this.currentUserId);
      this.user = this.storage.get(this.userToken);
      console.log('user: ', this.user);
    }

    this.socketService.onUser().subscribe((user: User) => {

      this.user = user;
      console.log('user: ', this.user);
      this.currentUserId = user.id;
      this.userToken = getUserStorageToken(user.id);
      this.storage.set(currentUserToken, this.currentUserId);
      this.storage.set(this.userToken, this.user);
      this.sharedService.setUser(user);
      this.sharedService.editUser(this.user);
    }, (err) => {
      if (err) {
        this.userToken = getUserStorageToken(this.currentUserId);
        this.user = this.storage.get(this.userToken);
        console.log('user: ', this.user);
      }
    });
    console.log('user: ', this.user);
  }

  private getDirectRoomUser(): void {
    if (this.directMessagesRoom) this.directRoomUserToken = getUserStorageToken(this.directMessagesRoom.to);

    if (!this.socketService.socket) this.socketService.initSocket();

    console.log('directRoomUserId', this.directMessagesRoom.to);
    this.socketService.sendRequestForUserById(this.directMessagesRoom.to);

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
  }

  getDirectRoom() {
    this.chatRoomToken = getChatRoomStorageToken(this.directMessagesRoomId);

    if (!this.socketService.socket) this.socketService.initSocket();
    console.log(this.socketService.socket);

    this.socketService.sendRequestForDirectMessagesRoomById(this.directMessagesRoomId, this.user.id);

    this.socketService.onDirectMessagesRoomById().subscribe(room => {
      console.log('direct room', room);

      this.directMessagesRoom = room;
      this.messages = room.messages;
      this.storage.set(this.chatRoomToken, this.directMessagesRoom);
      console.log(this.directMessagesRoom);
      this.getDirectRoomUser();

    }, (err) => {
      if (err) {
        this.directMessagesRoom = this.storage.get(this.chatRoomToken);
        console.log('directRoom', this.directMessagesRoom);
      }
    });
    console.log(this.directMessagesRoom);
    this.socketService.sendRequestForAllChatRooms(this.user);
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
    if (!messageContent) {
      return;
    }

    this.timeNow = new Date();
    console.log('this.user', this.user);
    this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage', this.directRoomUser);
    console.log(this.message);
    this.socketService.sendDirectMessagesRoomMessage(this.message, this.directRoomUser.id, this.directMessagesRoom.id);
    this.getDirectRoom();

    console.log('messages: ',this.messages);
    this.messageContent = null;
    console.log('sentMessage messages: ',this.messages);
    console.log('ChatRoom: ', this.directMessagesRoom);
  }
}
