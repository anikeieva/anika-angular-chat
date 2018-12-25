import {
  Component, Inject, InjectionToken,
  OnInit,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "angular-webstorage-service";
import {currentUserToken, getUserStorageToken} from "../../shared/model/getStorageToken";
import {ChatRoom} from "../../shared/model/chat-room";
import {SharedService} from "../../shared/servises/shared.service";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  public directRoomUser: User;
  public directRoomUserToken: string;
  public user: User;
  public currentUserId: string;
  public userToken: string;

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private sharedService: SharedService) {}

  ngOnInit(): void {
    this.getDirectRoomUser();
    this.getUser();
  }

  getDirectRoomUser() {
    this.route.queryParams.subscribe(param => {
      const id = param.id;
      this.directRoomUserToken = getUserStorageToken(id);

      if (this.socketService.socket) {
        this.socketService.sendRequestForUserById(id);
      }

      this.socketService.onUserById().subscribe((user: User) => {
        if (user) {
          this.directRoomUser = user;
          this.storage.set(this.directRoomUserToken, this.directRoomUser);
        }
      }, (err) => {
        if (err) {
          this.directRoomUser = this.storage.get(this.directRoomUserToken);
        }
      });
    });

    console.log('user: ',this.directRoomUser);
  }

  getUser() {
    if (!this.user) {
      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);
      this.user = this.storage.get(this.userToken);
      console.log('user: ', this.user);
    }

    this.socketService.onUser().subscribe((user: User) => {

      this.user = user;
      console.log('user: ', this.user);
      this.currentUserId = user.id;
      this.userToken = getUserStorageToken(user.id);
      this.storage.set(currentUserToken, this.currentUserId);
      this.storage.set(this.userToken, this.user);
      this.sharedService.setUser(user);
    }, (err) => {
      if (err) {
        this.user = this.storage.get(this.userToken);
        console.log('user: ', this.user);
      }
    });
    console.log('user: ', this.user);
  }
}
