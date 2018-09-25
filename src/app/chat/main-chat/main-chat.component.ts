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
    this.sharedService.listen().subscribe(event => this.onEditUser(event));
  }

  ngOnInit() {
    this.messages = [];
    this.sharedService.getUser().subscribe(user => this.user = user);
  }

  sendMessage() {
    this.timeNow = new Date();
    this.user.action.sentMessage = true;
    this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage');
    this.messages.push(this.message);
    this.messageContent = null;
    console.log(this.messages);
  }

  onJoin() {
    this.timeNow = new Date();
    this.user.action.joined = true;
    this.message = new Message(this.user, `${this.user.firstName} ${this.user.lastName} joined to conversation`, this.timeNow, 'joined');
    this.messages.push(this.message);
  }

  onEditUser(event) {
    console.log(event);
    this.timeNow = new Date();
    this.user.action.edit = true;
    this.message = new Message(this.user, '', this.timeNow, 'edit');
    this.messages.push(this.message);
    console.log(this.messages);
  }
}
