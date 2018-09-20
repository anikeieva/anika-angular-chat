import {Component, OnInit} from '@angular/core';
import {User} from '../../shared/model/user';
import {SharedService} from '../../shared/servises/shared.service';
import {Message} from '../../shared/model/message';

const Action = {
  joined: 'joined',
  sentMessage: 'sentMessage'
};

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
  public action = Action;

  constructor(private sharedService: SharedService) {
  }

  ngOnInit() {
    this.messages = [];
    this.user = this.sharedService.getData();
    this.message = new Message(this.user, this.action.joined, '');
    this.messages.push(this.message);
  }

  sendMessage() {
    this.message = new Message(this.user, this.action.sentMessage, this.messageContent);
    this.messages.push(this.message);
    this.messageContent = null;
  }
}
