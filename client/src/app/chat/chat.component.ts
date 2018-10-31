import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {USER_STORAGE_TOKEN} from "../shared/model/userStorageToken";
import {SocketService} from "../shared/servises/socket.service";
import {ChatRoom} from "../shared/model/chat-room";
import {MAIN_CHAT_STORAGE_TOKEN} from "../shared/model/mainChatStorageToken";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  public user: User;
  public mainChatRoom: ChatRoom;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {}

  ngOnInit() {
    this.getChatRoom();
    this.getUserAll();
    console.log(this.socketService);
  }

  getChatRoom() {
    if (this.socketService.socket) {
      this.socketService.sendRequestForMainChatRoom();
    }

    this.socketService.onMainChatRoom().subscribe(mainChatRoom => {
      this.mainChatRoom = mainChatRoom;
      this.storage.set(MAIN_CHAT_STORAGE_TOKEN, this.mainChatRoom);
      console.log(this.mainChatRoom);
    }, (err) => {
      if (err) {
        this.mainChatRoom = this.storage.get(MAIN_CHAT_STORAGE_TOKEN);
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
      this.storage.set(USER_STORAGE_TOKEN, this.user);
      this.sharedService.setUser(user);
    }, (err) => {
      if (err) {
        this.user = this.storage.get(USER_STORAGE_TOKEN);
      }
    });
  }

  exit() {
    this.user.online = false;
    this.socketService.initSocket();
    this.socketService.sendUser(this.user);
    if (this.user.action.joined) {
      this.socketService.sendMainChatUser(this.user);
    }
  }
}
