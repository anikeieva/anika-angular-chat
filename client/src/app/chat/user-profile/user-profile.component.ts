import {
  Component, Inject,
  OnInit,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "angular-webstorage-service";
import {getUserStorageToken} from "../../shared/model/getStorageToken";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  public directRoomUser: User;
  public userToken: string;

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      const id = param.id;
      this.userToken = getUserStorageToken(id);

      if (this.socketService.socket) {
        this.socketService.sendRequestForUserById(id);
      }

      this.socketService.onUserById().subscribe((user: User) => {
        if (user) {
          this.directRoomUser = user;
          this.storage.set(this.userToken, this.directRoomUser);
        }
      }, (err) => {
        if (err) {
          this.directRoomUser = this.storage.get(this.userToken);
        }
      });
    });

    console.log('user: ',this.directRoomUser);
  }
}
