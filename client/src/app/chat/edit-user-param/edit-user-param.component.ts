import {Component, Inject, InjectionToken, OnInit} from '@angular/core';
import {SharedService} from '../../shared/servises/shared.service';
import {User} from '../../shared/model/user';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {SocketService} from "../../shared/servises/socket.service";
import {getUserStorageToken} from "../../shared/model/getStorageToken";

@Component({
  selector: 'app-edit-user-param',
  templateUrl: './edit-user-param.component.html',
  styleUrls: ['./edit-user-param.component.css']
})

export class EditUserParamComponent implements OnInit {
  public user: User;
  public userToken: string;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private socketService: SocketService) { }

  ngOnInit() {

    if (!this.user) {
      this.user = this.storage.get(this.userToken);
    }

    this.getUser();

  }

  getUser() {
    this.socketService.onUser().subscribe((user: User) => {
      this.user = user;
      this.userToken = getUserStorageToken(this.user.id);
      this.storage.set(this.userToken, this.user);
      this.sharedService.setUser(user);
    }, (err) => {
      if (err) {
        this.user = this.storage.get(this.userToken);
      }
    });
  }

}
