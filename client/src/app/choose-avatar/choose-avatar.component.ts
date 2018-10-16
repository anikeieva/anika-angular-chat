import {Component, Inject, OnInit} from '@angular/core';
import {SharedService} from "../shared/servises/shared.service";
import {User} from "../shared/model/user";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {USER_STORAGE_TOKEN} from "../shared/model/userStorageToken";
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';

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
              @Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit() {
    this.sharedService.getUser().subscribe(user => this.user = user);

    if (!this.user) {
      this.user = this.storage.get(USER_STORAGE_TOKEN);
    }
    this.storage.set(USER_STORAGE_TOKEN, this.user);

    for (let n = 0; n <= this.maxAvatarsNumbers; n++) {
      this.avatars.push(`src/app/images/avatars/${this.user.gender}/${n}.png`);
    }
  }

  changeAvatar(avatar) {
    if (this.user.avatar !== avatar) {
      this.user.avatar = avatar;
      this.sharedService.setUser(this.user);
      this.sharedService.updateUser.emit(this.user);
      this.storage.set(USER_STORAGE_TOKEN, this.user);
    }
   }

   closeDialog() {
      this.dialogRef.close();
   }
}
