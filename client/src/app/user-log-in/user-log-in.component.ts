import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserLogInParam} from "../shared/model/userLogInParam";
import {SocketService} from "../shared/servises/socket.service";
import {ActivatedRoute, Router} from "@angular/router";
import {currentUserToken} from "../shared/model/getStorageToken";
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";

@Component({
  selector: 'app-user-log-in',
  templateUrl: './user-log-in.component.html',
  styleUrls: ['./user-log-in.component.css']
})
export class UserLogInComponent implements OnInit {
  userLogInFormParam: FormGroup;
  userLogInParam: UserLogInParam;
  userIsAuthorized: boolean;

  constructor(private  socketService: SocketService,
              private router: Router,
              @Inject(SESSION_STORAGE) private storage: StorageService) {
    this.userLogInFormParam = new FormGroup({
      login: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.userIsAuthorized = true;
  }

  ngOnInit() {
    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.onUserLogIn().subscribe((userLogIn) => {
      if (userLogIn) {
        this.userIsAuthorized = true;
        this.storage.set(currentUserToken, userLogIn);
        this.router.navigate(['/chat']);
      }
    });

    this.socketService.onUserNotLogIn().subscribe((userNotLogIn) => {
      if (userNotLogIn) {
        this.userIsAuthorized = false;
        this.userLogInFormParam.setValue({
          login: null,
          password: null
        });
      }
    });

  }

  isEnabledLogIn() {
    return this.userLogInFormParam.status === 'VALID';
  }

  logIn() {
    console.log(this.userLogInFormParam);

    this.userLogInParam = this.userLogInFormParam.value;
    if (!this.socketService.socket) this.socketService.initSocket();
    this.socketService.sendUserLogInParam(this.userLogInParam);
  }
}
