import {
  AfterViewInit,
  Component,
  ElementRef, Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {User} from '../../shared/model/user';
import {SharedService} from '../../shared/servises/shared.service';
import {Message} from '../../shared/model/message';
import {SocketService} from "../../shared/servises/socket.service";
import {MatList, MatListItem} from "@angular/material";
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {USER_STORAGE_TOKEN} from "../../shared/model/userStorageToken";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit, AfterViewInit {

  public messageContent: string;
  public messages: Message[];
  private message: Message;
  public user: User;
  public timeNow: Date;
  public subscription;

  @ViewChild(MatList, { read: ElementRef }) matList: ElementRef;
  @ViewChildren(MatListItem, { read: ElementRef }) matListItems: QueryList<MatListItem>;

  constructor(private sharedService: SharedService,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {
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

    this.socketService.onMessage()
      .subscribe((message: Message) => {
        this.messages.push(message);
      });
  }

  private getUser() {
    this.sharedService.getUser().subscribe(user => this.user = user);
    this.subscription = this.sharedService.listenUser().pipe(take(1)).subscribe(paramBefore => this.onEditUser(paramBefore));
    if (!this.user) {
      this.user = this.storage.get(USER_STORAGE_TOKEN);
    }
    this.storage.set(USER_STORAGE_TOKEN, this.user);
  }

  sendMessage(messageContent: string): void {
    if (!messageContent) {
      return;
    }

    this.timeNow = new Date();
    this.user.action.sentMessage = true;
    this.message = new Message(this.user, this.messageContent, this.timeNow, 'sentMessage');
    this.socketService.send(this.message);

    this.messageContent = null;
    console.log('sentMessage messages: ',this.messages);
  }

  onJoin(): void {
    this.user.action.joined = true;
    this.storage.set(USER_STORAGE_TOKEN, this.user);

    this.timeNow = new Date();
    this.message = new Message(this.user, `${this.user.firstName} ${this.user.lastName} joined to conversation`, this.timeNow, 'joined');
    this.sendNotification(this.message);
    console.log('join messages: ',this.messages);
  }

  onEditUser(param): void {

    if (param) {
      console.log('before: ', param);
      console.log('user: ' ,this.user);

      this.timeNow = new Date();

      for (let key in this.user) {
        this.user[key] = param.paramAfter[key];
      }
      this.user.action.edit = true;


      if (this.user.action.joined === true &&
        param.paramBefore.firstName !== this.user.firstName ||
        param.paramBefore.lastName !== this.user.lastName) {

        const messageContent = `${param.paramBefore.firstName} ${param.paramBefore.lastName} already is ${this.user.firstName} ${this.user.lastName}`;
        this.message = new Message(this.user, messageContent, this.timeNow, 'edit');
        console.log(this.message);
        this.sendNotification(this.message);
        console.log('edit messages: ',this.messages);
      }

      // this.subscription.unsubscribe();
      this.sharedService.editUserClear();
    }
  }

  sendNotification(message): void {
    this.socketService.send(message);
  }
}
