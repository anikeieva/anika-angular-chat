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
  public roomsToken: string;
  // public allChatRoomsToken: string;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {}

  ngOnInit() {
    // this.getChatRoom();
    this.getUserAll();
    console.log(this.socketService);
  }

  // getChatRoom() {
  //   this.allChatRoomsToken = getChatRoomStorageToken('allRooms');
  //
  //   this.socketService.onGetAllChatRooms().subscribe((rooms: ChatRoom[]) => {
  //       console.log('rooms: ', rooms);
  //       this.rooms = rooms;
  //       this.storage.set(this.allChatRoomsToken, this.rooms);
  //   }, (err) => {
  //     if (err) {
  //       this.rooms = this.storage.get(this.allChatRoomsToken);
  //       console.log('rooms: ', this.rooms);
  //     }
  //   });
  // }


  // getChatRoom() {
  //   this.mainChatRoomToken = getChatRoomStorageToken('main-chat');
  //   this.rooms = [];
  //
  //   this.socketService.onMainChatRoom().subscribe(mainChatRoom => {
  //     this.mainChatRoom = mainChatRoom;
  //     if (!this.rooms.some((item) => item.id === this.mainChatRoom.id)) {
  //       this.rooms.push(this.mainChatRoom);
  //     }
  //
  //     this.storage.set(this.mainChatRoomToken, this.mainChatRoom);
  //     console.log(this.mainChatRoom);
  //   }, (err) => {
  //     if (err) {
  //       this.mainChatRoom = this.storage.get(this.mainChatRoomToken);
  //     }
  //   });
  //
  //   console.log(this.mainChatRoom);
  // }

  getUserAll() {
    this.sharedService.listenUser().subscribe(paramBefore => {
      this.getUser();
    });

    this.getUser();
  }

  getUser() {
    this.socketService.onUser().subscribe((user: User) => {

      this.user = user;
      console.log(user);

      this.userToken = getUserStorageToken(user.id);
      this.roomsToken = getChatRoomStorageToken(  `all_user-id=${user.id}`);

      console.log(this.userToken);
      console.log(this.roomsToken);
      this.storage.set(this.userToken, this.user);
      this.sharedService.setUser(user);
      console.log('get user from server');


      this.socketService.sendRequestForAllChatRooms(this.user);
      this.socketService.onGetAllChatRooms().subscribe((rooms) => {
        this.rooms = rooms;
        console.log('rooms: ',rooms);
        this.storage.set(this.roomsToken, this.rooms);
      });

    }, (err) => {
      if (err) {
        this.user = this.storage.get(this.userToken);
        console.log(this.userToken);
        console.log(this.user);
        this.rooms = this.storage.get(this.roomsToken);
        console.log('get user from storage');
      }
      console.log('no err');
      console.log(this.userToken);
    });

    // if (this.socketService.socket) {
    //   setTimeout(() => {
    //     console.log('user: ',this.user);
    //     this.userToken = getUserStorageToken(this.user.id);
    //     this.roomsToken = getChatRoomStorageToken(  `all_user-id=${this.user.id}`);
    //   }, 500);
    // }
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
