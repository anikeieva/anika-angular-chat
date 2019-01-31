import {
  Component, Inject,
  OnInit,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";
import {
  currentUserToken
} from "../../shared/model/getStorageToken";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  directRoomUser: User;
  user: User;
  currentUserId: string;
  private directRoomId: string;

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit(): void {
    this.getUser();
    this.getDirectRoomUser();
  }

  getUser() {
    this.currentUserId = this.storage.get(currentUserToken);

    if (!this.socketService.socket) this.socketService.initSocket();

    if (this.currentUserId) this.socketService.sendRequestForUserById(this.currentUserId);

    this.socketService.onUserById(this.currentUserId).subscribe((user: User) => {
      if (user) this.user = user;
    });

    this.socketService.onUser().subscribe((user: User) => {
      if (user.id === this.currentUserId) {
        this.user = user;
      } else {
        this.user = user;
        this.currentUserId = user.id;
        this.storage.set(currentUserToken, this.currentUserId);
      }
    });
  }

  getDirectRoomUser() {
    this.route.queryParams.subscribe(param => {
      const id = param.id;

      if (!this.socketService.socket) this.socketService.initSocket();

      this.socketService.sendRequestForUserById(id);

      this.socketService.onUserById(id).subscribe((user: User) => {
        if (user) {
          this.directRoomUser = user;
          this.getDirectRoomId();
        }
      });
    });

    console.log('direct user: ',this.directRoomUser);
  }

  getDirectRoomId() {
    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendRequestForDirectMessagesRoomId(this.user.id, this.directRoomUser.id);

    this.socketService.onDirectMessagesRoomId().subscribe((roomId: string) => {
      this.directRoomId = roomId;
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
