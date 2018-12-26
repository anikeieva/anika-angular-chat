import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {ChatRoom} from "../shared/model/chat-room";
import {getChatRoomStorageToken, getUserStorageToken} from "../shared/model/getStorageToken";
import {currentUserToken} from "../shared/model/getStorageToken";

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

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {}

  ngOnInit() {
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

    console.log(this.socketService);
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

      this.getUserDirects();
    }, (err) => {
      if (err) {
        this.user = this.storage.get(this.userToken);
        console.log('user: ', this.user);
        this.getUserDirects();
      }
    });
    console.log('user: ', this.user);
  }

  getUserDirects() {

    if (!this.user) {
      this.user = this.storage.get(this.userToken);
      console.log(this.user);
    }

    if (this.user) {
      console.log(this.user);
      this.roomsToken = getChatRoomStorageToken(  `all_user-id=${this.user.id}`);
      console.log(this.roomsToken);

      if (!this.rooms) this.rooms = this.storage.get(this.roomsToken);

      if (!this.socketService.socket) {
        this.socketService.initSocket();
      }

      this.socketService.sendRequestForAllChatRooms(this.user);

      this.socketService.onGetAllChatRooms().subscribe((rooms) => {
        this.rooms = rooms;
        console.log('rooms: ',rooms);
        this.storage.set(this.roomsToken, this.rooms);
      }, (err) => {
        if (err) {
          this.rooms = this.storage.get(this.roomsToken);
        }
      });

    }
  }

  exit() {
    this.socketService.initSocket();
    this.socketService.sendUserLogOut(this.user);
  }

  getQueryParams(room) {
    if (room) {
      if (room.type === 'direct') {
        return {id: room.id}
      }
    }
  }
}
