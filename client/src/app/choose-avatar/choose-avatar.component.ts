import {Component, Inject, OnInit} from '@angular/core';
import {SharedService} from "../shared/servises/shared.service";
import {User} from "../shared/model/user";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {currentUserToken} from "../shared/model/getStorageToken";

@Component({
  selector: 'app-choose-avatar',
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.css']
})
export class ChooseAvatarComponent implements OnInit {
  user: User;
  avatars: Array<string> = [];
  private maxAvatarsNumbers = 2;
  private currentUserId: string;

  constructor(private sharedService: SharedService,
              private dialogRef: MatDialogRef<ChooseAvatarComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {}

  ngOnInit() {
    this.sharedService.listenUser().subscribe(param => {
      if (param) {
        if (param.paramAfter) {
          this.user = param.paramAfter;
        }
      } else {
        this.getUser();
      }
    });

    this.getUser();
  }

  getAvatars() {
    if (this.avatars.length < 1) {
      for (let n = 0; n <= this.maxAvatarsNumbers; n++) {
        this.avatars.push(`src/app/images/avatars/${this.user.gender}/${n}.png`);
      }
    }
  }
  
  getUser() {
    this.currentUserId = this.storage.get(currentUserToken);

    if (!this.socketService.socket) this.socketService.initSocket();

    if (this.currentUserId) this.socketService.sendRequestForUserById(this.currentUserId);

    this.socketService.onUserById(this.currentUserId).subscribe((user: User) => {
      if (user) this.user = user;
      this.getAvatars();
    });


    this.socketService.onUser().subscribe((user: User) => {
      if (user.id === this.currentUserId) {
        this.user = user;
      } else {
        this.user = user;
        this.currentUserId = user.id;
        this.storage.set(currentUserToken, this.currentUserId);
      }
      this.getAvatars();
    });
  }

  changeAvatar(avatar) {
    if (this.user.avatar !== avatar) {
      this.user.avatar = avatar;

      if (!this.socketService.socket) {
        this.socketService.initSocket();
      }
      this.socketService.sendUser(this.user);
      if (this.user.action.joined) {
        this.socketService.sendMainChatUser(this.user);
      }
      this.sharedService.editUser(this.user);
    }
   }

   closeDialog() {
      this.dialogRef.close();
   }
}
