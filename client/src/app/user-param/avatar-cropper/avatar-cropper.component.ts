import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {SocketService} from "../../shared/servises/socket.service";
import {ImageCroppedEvent} from "ngx-image-cropper";
import {User} from "../../shared/model/user";
import {getUserStorageToken} from "../../shared/model/getStorageToken";
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";
import {SharedService} from "../../shared/servises/shared.service";

@Component({
  selector: 'app-avatar-cropper',
  templateUrl: './avatar-cropper.component.html',
  styleUrls: ['./avatar-cropper.component.css']
})
export class AvatarCropperComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  user: User;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private socketService: SocketService,
              public dialogRef: MatDialogRef<AvatarCropperComponent>,
              private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit() {
    this.imageChangedEvent = this.data.event;
    this.user = this.data.user;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  avatarCropped() {
    if (this.croppedImage && this.user) {
      this.user.avatar = this.croppedImage;

      if (!this.socketService.socket) this.socketService.initSocket();
      this.socketService.sendUser(this.user);

      if (this.user.action.joined) this.socketService.sendMainChatUser(this.user);
      this.storage.set(getUserStorageToken(this.user.id), JSON.stringify(this.user));
      this.sharedService.editUser(this.user);

      this.closeDialog();
    }
  }

  cancel() {
    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }

}
