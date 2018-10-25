import {Component, Inject, OnInit} from '@angular/core';
import {SocketService} from "../shared/servises/socket.service";
import {SESSION_STORAGE, StorageService} from "angular-webstorage-service";
import {USER_STORAGE_TOKEN} from "../shared/model/userStorageToken";

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent implements OnInit {

  constructor(private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) { }

  ngOnInit() {
    this.storage.remove(USER_STORAGE_TOKEN);
    this.socketService.initSocket();
  }

}
