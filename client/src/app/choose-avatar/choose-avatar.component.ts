import {Component, OnInit} from '@angular/core';
import {SharedService} from "../shared/servises/shared.service";
import {User} from "../shared/model/user";

@Component({
  selector: 'app-choose-avatar',
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.css']
})
export class ChooseAvatarComponent implements OnInit {
  public user: User;
  public avatars: Array<string> = [];
  private maxAvatarsNumbers = 2;
  private gender: string;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.getUser().subscribe(user => this.user = user);

    for (let n = 0; n <= this.maxAvatarsNumbers; n++) {
      this.avatars.push(`src/app/images/avatars/${this.user.gender}/${n}.png`);
    }
  }

  changeAvatar(avatar) {
    if (this.user.avatar !== avatar) {
      this.user.avatar = avatar;
      this.sharedService.setUser(this.user);
      this.sharedService.updateUser.emit(this.user);
    }
   }
}
