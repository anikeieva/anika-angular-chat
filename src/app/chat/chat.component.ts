import {Component, OnInit} from '@angular/core';
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
  public mainChatInfo: ChatsInfo;

  constructor(private sharedService: SharedService) {
    this.sharedService.updateUser.subscribe(data => this.user = data);
    this.mainChatInfo = new ChatsInfo('Main chat', 'src/app/images/chat/chat.png', 'Online chat');
  }

  ngOnInit() {
    this.sharedService.getUser().subscribe(user => this.user = user);
  }
}
