import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {ChatRoom} from "../shared/model/chat-room";
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
    this.storage.clear();
    if (!this.socketService.socket) this.socketService.initSocket();

    if(this.currentUserId) {
      this.socketService.sendUserLogOut(this.currentUserId);
    } else {
      this.currentUserId = this.storage.get(currentUserToken);
    }
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
