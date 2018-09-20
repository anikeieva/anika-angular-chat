import { Component, OnInit } from '@angular/core';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {ChatsInfo} from '../shared/model/chatsInfo';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  public user: User;
  public wasChosen = false;
  public mainChatInfo: ChatsInfo;

  constructor(private sharedService: SharedService) { }

  ngOnInit() {
    this.user = this.sharedService.getUser();
    this.mainChatInfo = new ChatsInfo('Main chat', 'src/app/images/chat/chat.png', 'Online chat');
  }

  onOpenChat() {
    this.wasChosen = true;
  }

}
