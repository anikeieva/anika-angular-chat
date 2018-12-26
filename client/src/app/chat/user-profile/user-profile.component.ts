import {
  Component, Inject,
  OnInit,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "angular-webstorage-service";
import {currentUserToken, getChatRoomStorageToken, getUserStorageToken} from "../../shared/model/getStorageToken";
import {SharedService} from "../../shared/servises/shared.service";
import {ChatRoom} from "../../shared/model/chat-room";

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
  public directRoomToken: string;
  public directRoom: ChatRoom;

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
      }

      this.socketService.sendRequestForUserById(id);

      this.socketService.onUserById().subscribe((user: User) => {
        if (user) {
          this.directRoomUser = user;
          this.storage.set(this.directRoomUserToken, this.directRoomUser);
          // this.getDirectRoomId();
        }
      }, (err) => {
        if (err) {
          this.directRoomUser = this.storage.get(this.directRoomUserToken);
          // this.getDirectRoomId();
        }
      });
    });

    console.log('direct user: ',this.directRoomUser);
    this.getDirectRoomId()
  }

  getDirectRoomId() {

    console.log(this.user);
    console.log(this.directRoomUser);
    console.log(this.directRoomId);

    if (!this.directRoom) {
      this.directRoom = this.storage.get(this.directRoomToken);
      console.log(this.directRoom);
    }

    if (!this.socketService.socket) {
      this.socketService.initSocket();
    }

    this.socketService.sendRequestForDirectMessagesRoom(this.user.id, this.directRoomUser.id);
    this.socketService.onDirectMessagesRoom().subscribe((room: ChatRoom) => {
      console.log('room: ',room);
      this.directRoom = room;
      this.directRoomId = room.id;
      this.directRoomToken = getChatRoomStorageToken(room.id);
      this.storage.set(this.directRoomToken, room);
      console.log(this.directRoomId);
      console.log(this.directRoom);
    }, (err) => {
      if(err) {
        console.log(this.directRoomId);
        this.directRoom = this.storage.get(this.directRoomToken);
        console.log(this.directRoom);
      }
    });
  }
}
