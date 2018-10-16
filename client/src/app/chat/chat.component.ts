import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {ChatsInfo} from '../shared/model/chatsInfo';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {USER_STORAGE_TOKEN} from "../shared/model/userStorageToken";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  public user: User;
  public mainChatInfo: ChatsInfo;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {
    this.sharedService.updateUser.subscribe(data => this.user = data);
    this.mainChatInfo = new ChatsInfo('Main chat', 'src/app/images/chat/chat.png', 'Online chat');
  }

  ngOnInit() {
    this.sharedService.getUser().subscribe(user => this.user = user);
    if (!this.user) {
      this.user = this.storage.get(USER_STORAGE_TOKEN);
    }
    this.storage.set(USER_STORAGE_TOKEN, this.user);
  }
}
