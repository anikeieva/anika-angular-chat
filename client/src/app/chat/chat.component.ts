import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {ChatRoom} from "../shared/model/chat-room";
import {getChatRoomStorageToken, getUserStorageToken} from "../shared/model/getStorageToken";
import {currentUserToken} from "../shared/model/getStorageToken";
import {Router} from "@angular/router";
import {BreakpointObserver} from '@angular/cdk/layout';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  public user: User;
  public userToken: string;
  public rooms: ChatRoom[];
  public roomsToken: string;
  public currentUserId: string;
  public isChatRoomActive: boolean;
  public isMobile: boolean;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService,
              private router: Router,
              private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {

    this.isMobile = this.breakpointObserver.isMatched('(max-width: 600px)');

    if (this.router.url.includes('main-chat') ||
      this.router.url.includes('room') ||
      this.router.url.includes('profile')) {
      this.isChatRoomActive = true;
    } else {
      this.isChatRoomActive = false;
    }

    this.sharedService.listenUser().subscribe(param => {
      console.log('param: ', param);
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

    console.log("socket: ", this.socketService.socket);


    this.socketService.onDirectMessagesRoomMessage().subscribe(message => {
      console.log(message);
      if (message) {
        this.getUserDirects();
      }
    });

    this.socketService.onMainChatMessageNotification().subscribe(message => {
      console.log(message);
      if (message) {
        this.getUserDirects();
      }
    });
  }

  getUser() {
    this.currentUserId = this.storage.get(currentUserToken);
    console.log('currentUserId',this.currentUserId);

    this.userToken = getUserStorageToken(this.currentUserId);
    if (!this.user && this.storage.has(this.userToken)) {
      this.user = JSON.parse(this.storage.get(this.userToken));
      console.log('user no, start: ', this.user);
      this.getUserDirects();
    }

    if (!this.socketService.socket) this.socketService.initSocket();
    console.log("socket: ", this.socketService.socket);

    this.socketService.onUser().subscribe((user: User) => {
      if (user && this.storage.has(currentUserToken)) {
        this.currentUserId = this.storage.get(currentUserToken);
        console.log('currentUserId',this.currentUserId);

        if (user.id === this.currentUserId) {
          this.user = user;
          console.log('user on: ', this.user);
          this.storage.set(this.userToken, JSON.stringify(this.user));
          this.getUserDirects();
        }
      } else {
        this.user = user;
        console.log('user on: ', this.user);
        this.currentUserId = user.id;
        this.userToken = getUserStorageToken(user.id);
        this.storage.set(currentUserToken, this.currentUserId);
        this.storage.set(this.userToken, JSON.stringify(this.user));
        this.sharedService.setUser(user);

        // this.getUserDirects();
      }

    }, (err) => {
      if (err) {
        this.currentUserId = this.storage.get(currentUserToken);
        this.userToken = getUserStorageToken(this.currentUserId);
        this.user = JSON.parse(this.storage.get(this.userToken));
        console.log('user on, err: ', this.user);
        // this.getUserDirects();
      }
    });

    console.log('user: ', this.user);
    console.log(currentUserToken);
    console.log(this.currentUserId);
    this.getUserDirects();
  }

  getUserDirects() {

    if (this.storage.has(currentUserToken)) {
      if (!this.currentUserId) this.currentUserId = this.storage.get(currentUserToken);
      console.log(this.currentUserId);

      // if (!this.rooms && this.storage.has(this.roomsToken)) this.rooms = JSON.parse(this.storage.get(this.roomsToken));
      // console.log('rooms: ',this.rooms);

      if (!this.socketService.socket) {
        this.socketService.initSocket();
      }

      console.log(this.socketService.socket);

      this.socketService.sendRequestForAllChatRooms(this.currentUserId);

      this.socketService.onGetAllChatRooms(this.currentUserId).subscribe((rooms) => {
        this.rooms = rooms;
        console.log('rooms: ',rooms);
        this.storage.set(this.roomsToken, JSON.stringify(this.rooms));
      }, (err) => {
        if (err) {
          this.rooms = JSON.parse(this.storage.get(this.roomsToken));
          console.log('rooms: ',this.rooms);
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
    if (this.router.url.includes('profile')) {
      return true;
    } else false;
  }

  getDirectRoomButtonBack() {
    if (this.router.url.includes('direct')) {
      return true;
    } else false;
  }

  getLastMessage(room, userId) {
    if (room && room.messages) {
      if (room.type === 'chat') {
        return room.messages[room.messages.length - 1].messageContent;
      } else if(room.type === 'direct') {
        const userMessages = room.messages.filter(message => message.from.id === userId);
        if (userMessages[userMessages.length - 1]) return userMessages[userMessages.length - 1].messageContent;
      }
    }
  }
}
