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
    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.deleteMessage(message._id, roomId, message.from.id);

    this.closeDialog();
  }

  edit() {
    this.dialogRef.close('edit');
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
