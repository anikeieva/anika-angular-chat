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
  public mainChatRoom: ChatRoom;
  public mainChatRoomToken: string;
  public userToken: string;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {}

  ngOnInit() {
    this.getChatRoom();
    this.getUserAll();
    console.log(this.socketService);
  }

  getChatRoom() {
    this.mainChatRoomToken = getChatRoomStorageToken('main-chat');

    if (this.socketService.socket) {
      this.socketService.sendRequestForMainChatRoom();
    }

    this.socketService.onMainChatRoom().subscribe(mainChatRoom => {
      this.mainChatRoom = mainChatRoom;
      this.storage.set(this.mainChatRoomToken, this.mainChatRoom);
      console.log(this.mainChatRoom);
    }, (err) => {
      if (err) {
        this.mainChatRoom = this.storage.get(this.mainChatRoomToken);
      }
    });

    console.log(this.mainChatRoom);
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
    this.user.online = false;
    this.socketService.initSocket();
    this.socketService.sendUserLogOut(this.user);
  }
}
