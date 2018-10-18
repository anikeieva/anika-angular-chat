import {Component, Inject, OnInit} from '@angular/core';
import {SharedService} from '../../shared/servises/shared.service';
import {User} from '../../shared/model/user';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {USER_STORAGE_TOKEN} from "../../shared/model/userStorageToken";
import {SocketService} from "../../shared/servises/socket.service";

@Component({
  selector: 'app-edit-user-param',
  templateUrl: './edit-user-param.component.html',
  styleUrls: ['./edit-user-param.component.css']
})

export class EditUserParamComponent implements OnInit {
  public user: User;

  constructor(private sharedService: SharedService,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private socketService: SocketService) { }

  ngOnInit() {
    if (!this.user) {
      this.user = this.storage.get(USER_STORAGE_TOKEN);
    } else {
      this.socketService.onUser().subscribe((user: User) => {
        this.user = user;
        this.sharedService.setUser(user);
      });
    }

    this.storage.set(USER_STORAGE_TOKEN, this.user);
  }



}
