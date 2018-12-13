import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {ChatRoom} from "../shared/model/chat-room";
import {getChatRoomStorageToken, getUserStorageToken} from "../shared/model/getStorageToken";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  public user: User;
  public userToken: string;
  public rooms: ChatRoom[];
  public allChatRoomsToken: string;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {}

  ngOnInit() {
    this.getChatRoom();
    this.getUserAll();
    console.log(this.socketService);
  }

  getChatRoom() {
    this.allChatRoomsToken = getChatRoomStorageToken('allRooms');

    this.socketService.onGetAllChatRooms().subscribe((rooms: ChatRoom[]) => {
        console.log('rooms: ', rooms);
        this.rooms = rooms;
        this.storage.set(this.allChatRoomsToken, this.rooms);
    }, (err) => {
      if (err) {
        this.rooms = this.storage.get(this.allChatRoomsToken);
        console.log('rooms: ', this.rooms);
      }
    });
  }

  getUserAll() {
    this.sharedService.listenUser().subscribe(paramBefore => {
      this.getUser();
    });

    this.getUser();
  }

  getUser() {
    this.socketService.onUser().subscribe((user: User) => {
      this.user = user;
      this.userToken = getUserStorageToken(user.id);
      this.storage.set(this.userToken, this.user);
      this.sharedService.setUser(user);
      console.log('get user from server');
    }, (err) => {
      if (err) {
        this.user = this.storage.get(this.userToken);
        console.log('get user from storage');
      }
    });
  }

  exit() {
    // this.user.online = false;
    this.socketService.initSocket();
    this.socketService.sendUserLogOut(this.user);
  }

  getQueryParams(room) {
    if (room.type === 'direct') {
      return {id: room.id}
    }
  }
}
