import {
  Component, Inject,
  OnInit,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";
import {
  currentUserToken,
  getDirectRoomStorageToken,
  getUserStorageToken
} from "../../shared/model/getStorageToken";

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
  private directRoomId: string;
  public directRoomIdToken: string

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit(): void {
    this.getUser();
    this.getDirectRoomUser();
  }

  getUser() {
    if (this.storage.has(currentUserToken)) {
      this.currentUserId = this.storage.get(currentUserToken);
      this.userToken = getUserStorageToken(this.currentUserId);

      if (!this.user && this.storage.has(this.userToken)) {
        this.user = JSON.parse(this.storage.get(this.userToken));
        console.log('user: ', this.user);
      }
    }

    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.onUser().subscribe((user: User) => {
      if (user && this.storage.has(currentUserToken)) {
        this.currentUserId = this.storage.get(currentUserToken);

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
      if (err && this.storage.has(this.userToken)) {
        this.user = JSON.parse(this.storage.get(this.userToken));
        console.log('user: ', this.user);
      }
    });
    console.log('user: ', this.user);
  }

  getDirectRoomUser() {
    this.route.queryParams.subscribe(param => {
      const id = param.id;
      this.directRoomUserToken = getUserStorageToken(id);

      if (!this.socketService.socket) this.socketService.initSocket();

      this.socketService.sendRequestForUserById(id);

      this.socketService.onUserById(id).subscribe((user: User) => {
        if (user) {
          this.directRoomUser = user;
          this.storage.set(this.directRoomUserToken, JSON.stringify(user));
          console.log('directRoomUser on', this.directRoomUser);
          this.getDirectRoomId();
        }
      }, (err) => {
        if (err && this.storage.has(this.directRoomUserToken)) {
          this.directRoomUser = JSON.parse(this.storage.get(this.directRoomUserToken));
          console.log('directRoomUser on err', this.directRoomUser);
          this.getDirectRoomId();
        }
      });
    });

    console.log('direct user: ',this.directRoomUser);
  }

  getDirectRoomId() {
    this.directRoomIdToken = getDirectRoomStorageToken(this.user.id, this.directRoomUser.id);

    if (!this.directRoomId && this.storage.has(this.directRoomIdToken)) {
      this.directRoomId = this.storage.get(this.directRoomIdToken);
    }

    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendRequestForDirectMessagesRoomId(this.user.id, this.directRoomUser.id);

    this.socketService.onDirectMessagesRoomId().subscribe((roomId: string) => {
      this.directRoomId = roomId;
      this.storage.set(this.directRoomIdToken, this.directRoomId);
    }, (err) => {
      if(err && !this.directRoomId && this.storage.has(this.directRoomIdToken)) {
        this.directRoomId = this.storage.get(this.directRoomIdToken);
      }
    });
  }

  openDirectRoom() {
    if (this.storage.has(currentUserToken)) {
      if (!this.currentUserId) this.currentUserId = this.storage.get(currentUserToken);

      if (!this.socketService.socket) this.socketService.initSocket();

      this.socketService.sendDirectMessagesRoomNotification(this.currentUserId);
    }
  }
}
