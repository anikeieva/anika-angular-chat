import {Component, OnInit} from '@angular/core';
import {User} from '../../shared/model/user';
import {SharedService} from '../../shared/servises/shared.service';

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit {

  public messageContent: string;
  public messages: Array<string> = [];
  public user: User;

  constructor(private sharedService: SharedService) {
  }

  ngOnInit() {
    this.user = this.sharedService.getData();
  }

  sendMessage() {
    this.messages.push(this.messageContent);
    this.messageContent = null;
  }
}
