import {
  Component, Inject,
  OnInit,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";
import {SocketService} from "../../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "angular-webstorage-service";

@Component({
  selector: 'app-direct-messages-room',
  templateUrl: './direct-messages-room.component.html',
  styleUrls: ['./direct-messages-room.component.css']
})
export class DirectMessagesRoomComponent implements OnInit {

  public user: User;

  constructor(private route: ActivatedRoute,
              private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      const id = param.id;
      const token = `USER_BY_ID=${id}_STORAGE_TOKEN`;

      if (this.socketService.socket) {
        this.socketService.sendRequestForUserById(id);
      }

      this.socketService.onUserById().subscribe((user: User) => {
        if (user) {
          this.user = user;
          this.storage.set(token, this.user);
        }
      }, (err) => {
        if (err) {
          this.user = this.storage.get(token);
        }
      });
    });

    console.log('user: ',this.user);
  }
}
