import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {ChatsInfo} from '../shared/model/chatsInfo';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {USER_STORAGE_TOKEN} from "../shared/model/userStorageToken";
import {SocketService} from "../shared/servises/socket.service";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  public user: User;
  public mainChatInfo: ChatsInfo;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {

    this.mainChatInfo = new ChatsInfo('Main chat', 'src/app/images/chat/chat.png', 'Online chat');

    console.log(this.user);
  }

  ngOnInit() {

    this.sharedService.listenUser().pipe(take(1)).subscribe(paramBefore => {
      this.socketService.onUser().subscribe((user: User) => {
        this.user = user;
      });
    });

    if (!this.user) {
      this.user = this.storage.get(USER_STORAGE_TOKEN);
    }

    this.socketService.onUser().subscribe((user: User) => {
      this.user = user;
    });

    this.storage.set(USER_STORAGE_TOKEN, this.user);

    console.log(this.user);
  }
}
