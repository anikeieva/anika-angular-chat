import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {User} from '../../shared/model/user';
import {SharedService} from '../../shared/servises/shared.service';
import {Message} from '../../shared/model/message';
import {SocketService} from "../../shared/servises/socket.service";
import {Event} from "../../shared/model/event";
import {MatList, MatListItem} from "@angular/material";

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit, AfterViewInit {

  public messageContent: string;
  public messages: Message[];
  public message: Message;
  public user: User;
  public timeNow: Date;
  public ioConnection: any;

  @ViewChild(MatList, { read: ElementRef }) matList: ElementRef;
  @ViewChildren(MatListItem, { read: ElementRef }) matListItems: QueryList<MatListItem>;

  constructor(private sharedService: SharedService,
              private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.getUser();
    this.initIoConnection();
    this.socketService.onMessages().subscribe((messages) => this.messages = messages);
    console.log('init messages: ',this.messages);
  }

  ngAfterViewInit(): void {
    this.matListItems.changes.subscribe(elements => {
      this.scrollToBottom();
    });
  }

  private scrollToBottom(): void {
    try {
      this.matList.nativeElement.scrollTop = this.matList.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: Message) => {
        this.messages.push(message);
      });

    this.socketService.onEvent(Event.connect)
      .subscribe(() => console.log('connected'));

    this.socketService.onEvent(Event.disconnect)
      .subscribe(() => console.log('disconnected'));
  }

  private getUser() {
    this.sharedService.getUser().subscribe(user => this.user = user);
    this.sharedService.listenUser().subscribe(event => this.onEditUser(event));
  }

  sendMessage(messageContent: string): void {
    if (!messageContent) {
      return;
    }

    this.timeNow = new Date();
    this.user.action.sentMessage = true;
    this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage');
    // this.messages.push(this.message);
    this.socketService.send(this.message);

    this.messageContent = null;
    console.log('sentMessage messages: ',this.messages);
  }

  onJoin(): void {
    this.user.action.joined = true;
    this.sendNotification();
    console.log('join messages: ',this.messages);
  }

  onEditUser(event): void {
    console.log(event);
    this.user.action.edit = true;
    this.sendNotification();
    console.log('edit messages: ',this.messages);
  }

  sendNotification(): void {
    this.timeNow = new Date();

    if (this.user.action.joined) {
      this.message = new Message(this.user, `${this.user.firstName} ${this.user.lastName} joined to conversation`, this.timeNow, 'joined');
    } else if (this.user.action.edit) {
      this.message = new Message(this.user, `User already is ${this.user.firstName} ${this.user.lastName}`, this.timeNow, 'edit');
    }
    this.socketService.send(this.message);
  }
}
