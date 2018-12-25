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

      this.chatRoomToken = getChatRoomStorageToken(param.id);

      if (!this.directMessagesRoom) {
        this.directMessagesRoom = this.storage.get(this.chatRoomToken);
      }


      if (!this.socketService.socket) {
        this.socketService.initSocket();
      }

      this.socketService.sendRequestForDirectMessagesRoom(param.id, this.user);

      this.socketService.onDirectMessagesRoom().subscribe(room => {
        console.log('direct room', room);
        this.directMessagesRoom = room;
        const directMessagesRoomId = room.to;
        room.users.forEach(item => {
          if (item.id === room.to) {
            this.directRoomUser = item;
          }
        });
        this.messages = room.messages;
        console.log('socket in messages: ',this.messages);

        this.storage.set(this.chatRoomToken, this.directMessagesRoom);
        console.log(this.directMessagesRoom);

        if (!this.directRoomUser) {
          this.directRoomUser = this.storage.get(this.directRoomUserToken);
        }

        this.socketService.sendRequestForUserById(directMessagesRoomId);

        this.socketService.onUserById().subscribe((user: User) => {
          if (user) {
            this.directRoomUserToken = getUserStorageToken(user.id);
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
      }, (err) => {
        if (err) {
          this.directMessagesRoom = this.storage.get(this.chatRoomToken);
        }
      });

      console.log(this.directMessagesRoom);
  }

  getUser() {
    if (!this.user) {
      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);
      this.user = this.storage.get(this.userToken);
      console.log('user: ', this.user);
    }

    this.socketService.initSocket();

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
        this.user = this.storage.get(this.userToken);
        console.log('user: ', this.user);
      }
    });
    console.log('user: ', this.user);
  }

  getAllUsers() {
    this.getDirectRoomUser();
    this.getUser();
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
    // this.chatRoomToken = getChatRoomStorageToken(this.roomId);
    //
    // if (!this.socketService.socket) {
    //   this.socketService.initSocket();
    // }
    //
    // console.log(this.user);
    // console.log(this.directRoomUser);
    //
    // this.socketService.sendRequestForDirectMessagesRoom(this.user.id ,this.directRoomUser.id);
    //
    // this.socketService.onDirectMessagesRoom().subscribe(room => {
    //   this.directMessagesRoom = room;
    //   this.messages = room.messages;
    //   console.log('socket in messages: ',this.messages);
    //
    //   this.storage.set(this.chatRoomToken, this.directMessagesRoom);
    //   console.log(this.directMessagesRoom);
    // }, (err) => {
    //   if (err) {
    //     this.directMessagesRoom = this.storage.get(this.chatRoomToken);
    //   }
    // });
    //
    // console.log(this.directMessagesRoom);
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
