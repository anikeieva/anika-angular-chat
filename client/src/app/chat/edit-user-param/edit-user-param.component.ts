import {Component, Inject, InjectionToken, OnInit} from '@angular/core';
import {SharedService} from '../../shared/servises/shared.service';
import {User} from '../../shared/model/user';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {SocketService} from "../../shared/servises/socket.service";
import {currentUserToken, getUserStorageToken} from "../../shared/model/getStorageToken";

@Component({
  selector: 'app-edit-user-param',
  templateUrl: './edit-user-param.component.html',
  styleUrls: ['./edit-user-param.component.css']
})

export class EditUserParamComponent implements OnInit {
  public user: User;
  public userToken: string;
  private currentUserId: string;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private socketService: SocketService) { }

  ngOnInit() {
    this.getUser();
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
      this.currentUserId = user.id;
      this.userToken = getUserStorageToken(user.id);
      this.storage.set(currentUserToken, this.currentUserId);
      this.storage.set(this.userToken, this.user);
      this.sharedService.setUser(user);
      console.log('user: ', this.user);
    }, (err) => {
      if (err) {
        this.user = this.storage.get(this.userToken);
        console.log('user: ', this.user);
      }
    });
    console.log('user: ', this.user);
  }
}
