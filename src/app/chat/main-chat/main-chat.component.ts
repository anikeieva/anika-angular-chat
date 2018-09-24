import {Component, OnInit} from '@angular/core';
import {User} from '../../shared/model/user';
import {SharedService} from '../../shared/servises/shared.service';
import {Message} from '../../shared/model/message';

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit {

  public messageContent: string;
  public messages: Array<Message>;
  public message: Message;
  public user: User;
  public timeNow: Date;

  constructor(private sharedService: SharedService) {
  }

  ngOnInit() {
    this.messages = [];
    this.sharedService.getUser().subscribe(user => this.user = user);
  }

  sendMessage() {
    this.timeNow = new Date();
    this.message = new Message(this.user, this.messageContent, this.timeNow);
    this.user.action.sentMessage = true;
    this.messages.push(this.message);
    this.messageContent = null;
  }

  onJoin() {
    this.user.action.joined = true;
  }
}
