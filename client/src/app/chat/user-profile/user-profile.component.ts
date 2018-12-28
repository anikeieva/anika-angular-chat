import {
  Component, Inject,
  OnInit,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "angular-webstorage-service";
import {
  currentUserToken,
  getDirectRoomStorageToken,
  getUserStorageToken
} from "../../shared/model/getStorageToken";
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
  private directRoomId: string;
  public directRoomIdToken: string

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private sharedService: SharedService) {}

  ngOnInit(): void {
    this.getUser();
    this.getDirectRoomUser();
    // this.getDirectRoomId();
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

  getDirectRoomUser() {
    this.route.queryParams.subscribe(param => {
      const id = param.id;
      console.log(id);
      this.directRoomUserToken = getUserStorageToken(id);

      if (!this.socketService.socket) {
        this.socketService.initSocket();
      }

      if (!this.directRoomUser) {
        this.directRoomUser = this.storage.get(this.directRoomUserToken);
        console.log(this.directRoomUser);
      }

      this.socketService.sendRequestForUserById(id);

      this.socketService.onUserById().subscribe((user: User) => {
        if (user) {
          this.directRoomUser = user;
          console.log(this.directRoomUser);
        }
      }, (err) => {
        if (err) {
          this.directRoomUser = this.storage.get(this.directRoomUserToken);
          console.log(this.directRoomUser);
        }
      });
    });

    console.log('direct user: ',this.directRoomUser);
    this.getDirectRoomId();
  }

  getDirectRoomId() {

    this.directRoomIdToken = getDirectRoomStorageToken(this.user.id, this.directRoomUser.id);

    if (!this.directRoomId) {
      this.directRoomId = this.storage.get(this.directRoomIdToken);
    }

    if (!this.socketService.socket) {
      this.socketService.initSocket();
    }

    this.socketService.sendRequestForDirectMessagesRoomId(this.user.id, this.directRoomUser.id);
    this.socketService.onDirectMessagesRoomId().subscribe((roomId: string) => {
      console.log('room id: ', roomId);
      this.directRoomId = roomId;
      this.storage.set(this.directRoomIdToken, this.directRoomId);
    }, (err) => {
      if(err) {
        this.directRoomId = this.storage.get(this.directRoomIdToken);
        console.log(this.directRoomId);
      }
    });
  }
}
