import {Component, Inject, OnInit} from '@angular/core';
import {SharedService} from "../shared/servises/shared.service";
import {User} from "../shared/model/user";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {USER_STORAGE_TOKEN} from "../shared/model/userStorageToken";
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";

@Component({
  selector: 'app-choose-avatar',
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.css']
})
export class ChooseAvatarComponent implements OnInit {
  public user: User;
  public avatars: Array<string> = [];
  private maxAvatarsNumbers = 2;

  constructor(private sharedService: SharedService,
              private dialogRef: MatDialogRef<ChooseAvatarComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {}

  ngOnInit() {
    if (!this.user) {
      this.user = this.storage.get(USER_STORAGE_TOKEN);
    }

    this.socketService.onUser().subscribe((user: User) => {
      this.user = user;
      this.sharedService.setUser(user);
    }, (err) => {
      if (err) {
        this.user = this.storage.get(USER_STORAGE_TOKEN);
      }
    });

    this.storage.set(USER_STORAGE_TOKEN, this.user);

    for (let n = 0; n <= this.maxAvatarsNumbers; n++) {
      this.avatars.push(`src/app/images/avatars/${this.user.gender}/${n}.png`);
    }
  }

  changeAvatar(avatar) {
    if (this.user.avatar !== avatar) {
      this.user.avatar = avatar;

      console.log('user, def avatar: ', this.user);
      this.socketService.initSocket();
      this.socketService.sendUser(this.user);
      if (this.user.action.joined) {
        this.socketService.sendMainChatUser(this.user);
      }
      this.storage.set(USER_STORAGE_TOKEN, this.user);
      this.sharedService.editUser(null);
    }
   }

   closeDialog() {
      this.dialogRef.close();
   }
}
