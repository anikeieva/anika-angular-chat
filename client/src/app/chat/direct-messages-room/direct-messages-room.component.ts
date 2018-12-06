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
import {getChatRoomStorageToken, getUserStorageToken} from "../../shared/model/getStorageToken";

@Component({
  selector: 'app-direct-messages-room',
  templateUrl: './direct-messages-room.component.html',
  styleUrls: ['./direct-messages-room.component.css']
})
export class DirectMessagesRoomComponent implements OnInit {

  public user: User;
  public id: string;
  public messageContent: string;
  public messages: Message[];
  private message: Message;
  public timeNow: Date;
  public directMessagesRoom: ChatRoom;
  public chatRoomToken: string;
  public userToken: string;

  @ViewChild('messageList') messageList: ElementRef;
  @ViewChildren('messageListItem') messageListItem: QueryList<MatListItem>;

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit() {
    this.getUser();
    this.getChatRoom();
    // this.initIoConnection();
    //   this.socketService.onDirectMessagesRoomMessages().subscribe((messages) => this.messages = messages);
    //   console.log('init messages: ',this.messages);
  }

  private getUser(): void {
    this.route.queryParams.subscribe(param => {
      this.id = param.id;
      this.userToken = getUserStorageToken(this.id);

      if (this.socketService.socket) {
        this.socketService.sendRequestForUserById(this.id);
      }

      this.socketService.onUserById().subscribe((user: User) => {
        if (user) {
          this.user = user;
          this.storage.set(this.userToken, this.user);
        }
      }, (err) => {
        if (err) {
          this.user = this.storage.get(this.userToken);
        }
      });
    });

    console.log('user: ',this.user);
  }

  //
  // ngAfterViewInit(): void {
  //   this.messageListItem.changes.subscribe(elements => {
  //     this.scrollToBottom();
  //   });
  // }
  //
  // private scrollToBottom(): void {
  //   try {
  //     this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
  //   } catch (err) {
  //   }
  // }
  //
  // private initIoConnection(): void {
  //   this.socketService.initSocket();
  //
  //   this.socketService.onDirectMessagesRoomMessage()
  //     .subscribe((message: Message) => {
  //       this.messages.push(message);
  //     });
  // }

  getChatRoom() {
    this.chatRoomToken = getChatRoomStorageToken(this.id);

    if (this.socketService.socket) {
      this.socketService.sendRequestForDirectMessagesRoom(this.user);
    }

    this.socketService.onDirectMessagesRoom().subscribe(room => {
      this.directMessagesRoom = room;

      this.storage.set(this.chatRoomToken, this.directMessagesRoom);
      console.log(this.directMessagesRoom);
    }, (err) => {
      if (err) {
        this.directMessagesRoom = this.storage.get(this.chatRoomToken);
      }
    });

    console.log(this.directMessagesRoom);
  }

  // sendMessage(messageContent: string): void {
  //   if (!messageContent) {
  //     return;
  //   }
  //
  //   this.timeNow = new Date();
  //   this.user.action.sentMessage = true;
  //   this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage');
  //   this.socketService.sendDirectMessagesRoomMessage(this.message);
  //
  //   this.messageContent = null;
  //
  //   console.log('sentMessage messages: ',this.messages);
  //
  //   console.log('mainChatRoom: ', this.directMessagesRoom);
  // }
}
