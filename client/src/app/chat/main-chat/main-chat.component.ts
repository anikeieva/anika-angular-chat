import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef, Inject,
  OnInit,
  QueryList, Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {User} from '../../shared/model/user';
import {SharedService} from '../../shared/servises/shared.service';
import {Message} from '../../shared/model/message';
import {SocketService} from "../../shared/servises/socket.service";
import {MatDialog, MatListItem} from "@angular/material";
import {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {ChatRoom} from "../../shared/model/chat-room";
import {getChatRoomStorageToken, getUserStorageToken} from "../../shared/model/getStorageToken";
import {currentUserToken} from "../../shared/model/getStorageToken";
import {take} from "rxjs/operators";
import {Router} from "@angular/router";
import {ChooseMessageManipulatingComponent} from "../../choose-message-manipulating/choose-message-manipulating.component";
import {MessageDb} from "../../shared/model/messageDb";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit, AfterViewInit, AfterViewChecked {

  messageContent: string;
  messages: Message[];
  private message: Message;
  user: User;
  timeNow: Date;
  mainChatRoom: ChatRoom;
  mainChatRoomToken: string;
  userToken: string;
  currentUserId: string;
  isChatRoomActive: boolean;
  isMessageRequestEdit: boolean;
  currentMessageEdit: MessageDb;
  isMobile: boolean;
  isManipulatingMessageDesktop: boolean;
  messageSelectedForManipulatingDesktop: Message

  @ViewChild('messageList') messageList: ElementRef;
  @ViewChildren('messageListItem') messageListItem: QueryList<MatListItem>;
  @ViewChild('chat_room_footer') chatRoomFooter: ElementRef;
  @ViewChild('chat_room_content') chatRoomContent: ElementRef;
  @ViewChild('manipulating_message_desktop') manipulatingMessageDesktop: ElementRef;


  constructor(private sharedService: SharedService,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private router: Router,
              private renderer: Renderer2,
              private dialog: MatDialog,
              private breakpointObserver: BreakpointObserver) {
  }

  ngOnInit(): void {

    this.breakpointObserver.observe([
      '(max-width: 600px)'
    ]).subscribe((result: BreakpointState) => {
      this.isMobile = result.matches;
    });

    this.socketService.initSocket();

    this.isChatRoomActive = this.router.url.includes('main-chat') ||
      this.router.url.includes('room') ||
      this.router.url.includes('profile');

    this.sharedService.listenUser().pipe(take(1)).subscribe(param => {

      if (param) {
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
    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.onMainChatMessages().subscribe((messages) => {
      this.messages = messages;
    });

    this.socketService.onChatRoom('main-chat').subscribe(chatRoom => {
      this.mainChatRoom = chatRoom;
    });
  }

  ngAfterViewInit(): void {
    this.messageListItem.changes.subscribe(elements => {
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked() {
    this.getMessageContentHeight();
  }

  private getMessageContentHeight() {
    if (this.chatRoomFooter && this.chatRoomContent) {
      let footerHeight;

      if (this.isManipulatingMessageDesktop) {
        footerHeight = this.manipulatingMessageDesktop.nativeElement.offsetHeight + 30;
      } else {
        footerHeight = this.chatRoomFooter.nativeElement.offsetHeight + 30;
      }

      const chatRoomContentHeight = `calc(100% - 40px - ${footerHeight}px)`;
      this.renderer.setStyle(this.chatRoomContent.nativeElement, 'height', chatRoomContentHeight);
    }
  }

  private scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  getChatRoom() {
    this.mainChatRoomToken = getChatRoomStorageToken('main-chat');

    if (this.socketService.socket) this.socketService.sendRequestForChatRoom('main-chat');

    this.socketService.onChatRoom('main-chat').pipe(take(1)).subscribe(chatRoom => {
      this.mainChatRoom = chatRoom;

      this.storage.set(this.mainChatRoomToken, JSON.stringify(this.mainChatRoom));
    }, (err) => {
      if (err) {
        this.mainChatRoom = JSON.parse(this.storage.get(this.mainChatRoomToken));
      }
    });
  }

  private getUser() {
    if (!this.user && this.storage.has(currentUserToken)) {

      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);

      if (this.storage.has(this.userToken)) {
        this.user = JSON.parse(this.storage.get(this.userToken));
      }
    }

    this.socketService.onUser().subscribe((user: User) => {
      if (user && this.storage.has(currentUserToken)) {
        this.currentUserId = this.storage.get(currentUserToken);

        if (user.id === this.currentUserId) {
          this.user = user;
          this.storage.set(this.userToken, JSON.stringify(this.user));
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

  sendMessage(messageContent: string): void {
    if (!messageContent || /^\s*$/.test(messageContent)) {
      return;
    }

    if (this.isMessageRequestEdit && this.currentMessageEdit) {
      this.socketService.editMessage(messageContent, this.currentMessageEdit._id, this.mainChatRoom.id, this.currentMessageEdit.from.id);

      this.isMessageRequestEdit = false;
      this.messageContent = null;
      this.currentMessageEdit = null;
    } else {
      this.timeNow = new Date();
      this.user.action.sentMessage = true;
      this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage', null, false);
      this.socketService.sendMainChatMessage(this.message);
      this.sharedService.editUser(null);

      this.messageContent = null;
    }
  }

  onJoin(): void {
    this.user.action.joined = true;
    this.storage.set(this.userToken, JSON.stringify(this.user));
    this.socketService.initSocket();
    this.socketService.sendUser(this.user);
    // this.socketService.sendMainChatUser(this.user);
    this.socketService.sendChatRoomUser(this.user);

    this.timeNow = new Date();
    this.message = new Message(this.user, `${this.user.firstName} ${this.user.lastName} joined to conversation`, this.timeNow, 'joined', null, false);
    this.sendNotification(this.message);

    this.getChatRoom();
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

  getMessageManipulatingComponent(message) {

    if (this.messageSelectedForManipulatingDesktop) {
      this.cancelManipulatingMessageDesktop();
      return;
    }

    if (!message._id) {
      this.socketService.initSocket();
    }

    if (message.action === 'sentMessage') {
      if (this.isMobile) {
        const dialogRef = this.dialog.open(ChooseMessageManipulatingComponent, {
          data: {
            message: message,
            roomId: this.mainChatRoom.id
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'edit') {
            this.isMessageRequestEdit = true;
            this.currentMessageEdit = message;
            this.messageContent = message.messageContent;
          }
        });
      } else {
        this.isManipulatingMessageDesktop = true;
        this.messageSelectedForManipulatingDesktop = message;
      }
    }
  }

  cancelEditMessage() {
    this.isMessageRequestEdit = false;
    this.messageContent = null;
    this.currentMessageEdit = null;
  }

  cancelManipulatingMessageDesktop() {
    this.isManipulatingMessageDesktop = false;
    this.messageSelectedForManipulatingDesktop = null;
  }

  copyMessage(message) {
    if (message) {
      let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = message.messageContent;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');

      this.cancelManipulatingMessageDesktop();
    }
  }

  deleteMessage(message, roomId) {
    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.deleteMessage(message._id, roomId, message.from.id);

    this.cancelManipulatingMessageDesktop();
  }

  editMessage(message) {
    this.cancelManipulatingMessageDesktop();

    this.isMessageRequestEdit = true;
    this.currentMessageEdit = message;
    this.messageContent = message.messageContent;
  }
}
