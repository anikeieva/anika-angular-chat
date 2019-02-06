import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {SocketService} from "../shared/servises/socket.service";

@Component({
  selector: 'app-choose-message-manipulating',
  templateUrl: './choose-message-manipulating.component.html',
  styleUrls: ['./choose-message-manipulating.component.css']
})
export class ChooseMessageManipulatingComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private socketService: SocketService,
              public dialogRef: MatDialogRef<ChooseMessageManipulatingComponent>) {}

  ngOnInit() {}

  copy(message) {
    if (message) {
      let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = message.messageContent;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');

      this.closeDialog();
    }
  }

  delete(message, roomId) {
    console.log(message);
    if (!this.socketService.socket) this.socketService.initSocket();

    if (message.to) this.socketService.deleteMessageDirect(message.from.id, message.to.id, message._id, roomId);
    else this.socketService.deleteMessage(message._id, roomId);

    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
