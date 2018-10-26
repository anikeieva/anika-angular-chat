import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserLogInParam} from "../shared/model/userLogInParam";
import {SocketService} from "../shared/servises/socket.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-user-log-in',
  templateUrl: './user-log-in.component.html',
  styleUrls: ['./user-log-in.component.css']
})
export class UserLogInComponent implements OnInit {
  public userLogInFormParam: FormGroup;
  public userLogInParam: UserLogInParam;
  public userIsAuthorized: boolean;

  constructor(private  socketService: SocketService,
              private router: Router,
              private route: ActivatedRoute) {
    this.userLogInFormParam = new FormGroup({
      login: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.socketService.onUserLogIn().subscribe((user) => {
      this.userIsAuthorized = true;
      this.router.navigate(['/chat'], { relativeTo: this.route });
      console.log('user is authorized');
    });

    this.socketService.onUserNotLogIn().subscribe((userNotLogIn) => {
      this.userIsAuthorized = false;
      this.userLogInFormParam.setValue({
        login: null,
        password: null
      });
      console.log('user is not authorized');
    });

  }

  isEnabledLogIn() {
    return this.userLogInFormParam.status === 'VALID';
  }

  logIn() {
    console.log(this.userLogInFormParam);

    this.userLogInParam = this.userLogInFormParam.value;
    this.socketService.sendUserLogInParam(this.userLogInParam);
  }
}
