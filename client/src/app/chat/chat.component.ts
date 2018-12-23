import {Component, Inject, InjectionToken, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {ChatRoom} from "../shared/model/chat-room";
import {getChatRoomStorageToken, getUserStorageToken} from "../shared/model/getStorageToken";

const currentUserToken = 'CURRENT_USER_id_TOKEN';

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
    this.getUser();
    this.socketService.initSocket();
    console.log(this.socketService);
  }

  getUser() {
    this.sharedService.getUser().subscribe(user => this.user = user);

    if (!this.user) {
      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);
      console.log(this.userToken);
      this.user = this.storage.get(this.userToken);
      console.log(this.user);
    }
    this.socketService.onUser().subscribe((user: User) => {

      this.user = user;
      this.currentUserId = user.id;
      console.log(this.currentUserId);
      console.log(user);

      this.userToken = getUserStorageToken(user.id);
      this.storage.set(currentUserToken, this.currentUserId);
      console.log(this.userToken);
      this.storage.set(this.userToken, this.user);
      this.sharedService.setUser(this.user);
      console.log('get user from server');

      this.getUserDirects();

    }, (err) => {
      if (err) {

        // if (this.userToken) {
        this.sharedService.getUser().subscribe(user => this.user = user);
        console.log(this.user);
        console.log(this.userToken);
        console.log(this.storage.get(this.userToken));
          this.user = this.storage.get(this.userToken);
        console.log(this.user);
          this.getUserDirects();
          console.log(this.userToken);
        // }
        console.log(this.user);
        console.log('get user from storage');
      }
    });


    console.log(this.user);
    console.log(this.userToken);
    this.storage.set(this.userToken, this.user);
    console.log(this.user);
  }

  getUserDirects() {

    if (!this.user) {
      this.user = this.storage.get(this.userToken);
      console.log(this.user);
    }

    if (this.user) {
      console.log(this.userToken);
      console.log(this.user);
      this.roomsToken = getChatRoomStorageToken(  `all_user-id=${this.user.id}`);
      console.log(this.roomsToken);

      if (!this.rooms) this.rooms = this.storage.get(this.roomsToken);

      console.log(this.rooms);

      if (this.socketService.socket) this.socketService.sendRequestForAllChatRooms(this.user);
      this.socketService.onGetAllChatRooms().subscribe((rooms) => {
        this.rooms = rooms;
        console.log('rooms: ',rooms);
        this.storage.set(this.roomsToken, this.rooms);
      }, (err) => {
        if (err) {
          this.rooms = this.storage.get(this.roomsToken);
        }
      });

      this.storage.set(this.roomsToken, this.rooms);

    }
  }

  exit() {
    // this.user.online = false;
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
