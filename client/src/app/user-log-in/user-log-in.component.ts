import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserLogInParam} from "../shared/model/userLogInParam";
import {SocketService} from "../shared/servises/socket.service";

@Component({
  selector: 'app-user-log-in',
  templateUrl: './user-log-in.component.html',
  styleUrls: ['./user-log-in.component.css']
})
export class UserLogInComponent implements OnInit {
  public userLogInFormParam: FormGroup;
  public userLogInParam: UserLogInParam;

  constructor(private  socketService: SocketService) {
    this.userLogInFormParam = new FormGroup({
      login: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
  }

  isEnabledLogIn() {
    return this.userLogInFormParam.status === 'VALID';
  }

  logIn() {
    console.log(this.userLogInFormParam);

    this.userLogInParam = this.userLogInFormParam.value;
    this.socketService.sendUserLogInParam(this.userLogInParam);

    this.userLogInFormParam.setValue({
      login: null,
      password: null
    });
  }
}
