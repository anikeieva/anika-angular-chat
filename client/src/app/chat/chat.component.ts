import {Component, Inject, OnInit} from '@angular/core';
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
export class ChatComponent implements OnInit {
  user: User;
  userToken: string;
  rooms: ChatRoom[];
  currentUserId: string;
  isChatRoomActive: boolean;
  isMobile: boolean;

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

    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.onDirectRoomMessage().subscribe(message => {
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
    }

    if (!this.socketService.socket) this.socketService.initSocket();

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
      }

    });

    this.getUserDirects();
  }

  getUserDirects() {

    if (this.storage.has(currentUserToken)) {
      if (!this.currentUserId) this.currentUserId = this.storage.get(currentUserToken);

      if (!this.socketService.socket) this.socketService.initSocket();

      this.socketService.sendRequestForAllChatRooms(this.currentUserId);

      this.socketService.onGetAllChatRooms(this.currentUserId).pipe(take(1)).subscribe((rooms) => {
        this.rooms = rooms;
      });
    }
  }

  exit() {
    this.socketService.initSocket();
    this.socketService.sendUserLogOut(this.currentUserId);
    this.storage.clear();
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
}
