import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit {

  public messageContent;

  constructor() { }

  ngOnInit() {
  }

  sendMessage() {
    this.messageContent = null;
  }

}
