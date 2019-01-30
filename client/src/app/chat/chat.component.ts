import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {ChatRoom} from "../shared/model/chat-room";
import {getUserStorageToken} from "../shared/model/getStorageToken";
import {currentUserToken} from "../shared/model/getStorageToken";
import {Router} from "@angular/router";
import {BreakpointObserver} from '@angular/cdk/layout';
import {take} from "rxjs/operators";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  public user: User;
  public userToken: string;
  public rooms: ChatRoom[];
  public roomsToken: string;
  public currentUserId: string;
  public isChatRoomActive: boolean;
  public isMobile: boolean;
  public userRoomsSubscribe: any;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService,
              private router: Router,
              private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {

    this.isMobile = this.breakpointObserver.isMatched('(max-width: 600px)');

    this.isChatRoomActive = this.router.url.includes('main-chat') ||
      this.router.url.includes('room') ||
      this.router.url.includes('profile');

    this.sharedService.listenUser().subscribe(param => {

      if (param) {
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

    this.socketService.onDirectMessagesRoomMessageNotification().subscribe(message => {
      if (message) this.getUserDirects();
    });

    this.socketService.onDirectMessagesRoomNotification().subscribe(message => {
      if (message) this.getUserDirects();
    });

    this.socketService.onMainChatMessageNotification().subscribe(message => {
      if (message) this.getUserDirects();
    });
  }

  getUser() {
    this.currentUserId = this.storage.get(currentUserToken);
    this.userToken = getUserStorageToken(this.currentUserId);

    if (!this.user && this.storage.has(this.userToken)) {
      this.user = JSON.parse(this.storage.get(this.userToken));
      console.log('user storage: ', this.user);
    }

    if (!this.socketService.socket) this.socketService.initSocket();

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
      }

    }, (err) => {
      if (err) {
        this.currentUserId = this.storage.get(currentUserToken);
        this.userToken = getUserStorageToken(this.currentUserId);
        this.user = JSON.parse(this.storage.get(this.userToken));
      }
    });

    console.log('user after: ', this.user);
    this.getUserDirects();
  }

  getUserDirects() {

    if (this.storage.has(currentUserToken)) {
      if (!this.currentUserId) this.currentUserId = this.storage.get(currentUserToken);

      if (!this.socketService.socket) this.socketService.initSocket();

      this.socketService.sendRequestForAllChatRooms(this.currentUserId);

      this.userRoomsSubscribe = this.socketService.onGetAllChatRooms(this.currentUserId).pipe(take(1)).subscribe((rooms) => {
        this.rooms = rooms;
        console.log('rooms: ',rooms);
        this.storage.set(this.roomsToken, JSON.stringify(this.rooms));
      }, (err) => {
        if (err) {
          this.rooms = JSON.parse(this.storage.get(this.roomsToken));
          console.log('rooms err: ',this.rooms);
        }
      });

    }
  }

  exit() {
    this.storage.clear();
    this.socketService.initSocket();
    this.socketService.sendUserLogOut(this.user.id);
  }

  getQueryParams(room) {
    if (room) {
      if (room.type === 'direct') {
        return {id: room.id}
      }
    }
  }

  activeChatRoom() {
    this.isChatRoomActive = true;
  }

  redirectToChat() {
    this.router.navigateByUrl('/chat');
    this.isChatRoomActive = false;
  }

  getProfileButtonBack() {
    return this.router.url.includes('profile');
  }

  getDirectRoomButtonBack() {
    return this.router.url.includes('direct');
  }

  getLastMessage(room, userId) {
    if (room && room.messages) {
      if (room.type === 'chat') {
        return room.messages[room.messages.length - 1].messageContent;
      } else if(room.type === 'direct') {
        const userMessages = room.messages.filter(message => message.to.id === userId);
        if (userMessages[userMessages.length - 1]) {
         if (userMessages.length > 0) {
           return userMessages[userMessages.length - 1].messageContent;
         } else {
           return room.type;
         }
        }
      }
    }
  }

  ngOnDestroy() {
    this.userRoomsSubscribe.unsubscribe();
  }
}
