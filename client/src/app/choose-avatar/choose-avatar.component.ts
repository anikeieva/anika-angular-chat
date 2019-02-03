import {Component, Inject, OnInit} from '@angular/core';
import {SharedService} from "../shared/servises/shared.service";
import {User} from "../shared/model/user";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {currentUserToken, getUserStorageToken} from "../shared/model/getStorageToken";

@Component({
  selector: 'app-choose-avatar',
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.css']
})
export class ChooseAvatarComponent implements OnInit {
  user: User;
  avatars: Array<string> = [];
  private maxAvatarsNumbers = 2;
  userToken: string;
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
          console.log('user', this.user);
        }
      } else {
        this.getUser();
      }
    });

    this.getUser();

    for (let n = 0; n <= this.maxAvatarsNumbers; n++) {
      this.avatars.push(`src/app/images/avatars/${this.user.gender}/${n}.png`);
    }
  }
  
  getUser() {
    if (!this.user) {
      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);
      this.user = JSON.parse(this.storage.get(this.userToken));
      console.log('user storage: ', this.user);
    }

    this.socketService.onUser().subscribe((user: User) => {
      if (user && this.storage.has(currentUserToken)) {
        this.currentUserId = this.storage.get(currentUserToken);
        console.log('currentUserId',this.currentUserId);

        if (user.id === this.currentUserId) {
          this.user = user;
          console.log('user on: ', this.user);
          this.storage.set(this.userToken, JSON.stringify(this.user));
        }
      } else {
        this.user = user;
        console.log('user on: ', this.user);
        this.currentUserId = user.id;
        this.userToken = getUserStorageToken(user.id);
        this.storage.set(currentUserToken, this.currentUserId);
        this.storage.set(this.userToken, JSON.stringify(this.user));
      }
    }, (err) => {
      if (err) {
        this.user = JSON.parse(this.storage.get(this.userToken));
        console.log('user err: ', this.user);
      }
    });
    console.log('user: ', this.user);
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
      this.storage.set(this.userToken, JSON.stringify(this.user));
    }
   }

   closeDialog() {
      this.dialogRef.close();
   }
}
