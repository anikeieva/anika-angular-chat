import {Component, Inject, OnInit} from '@angular/core';
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";
import {currentUserToken} from "../shared/model/getStorageToken";

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent implements OnInit {
  isSignUp: boolean = true;
  activeButtonColor: string = '#8a2ae2';
  passiveButtonColor: string = '#767676';
  signUpButtonColor: string = this.activeButtonColor;
  signInButtonColor: string = this.passiveButtonColor;

  constructor(@Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit() {}

  signUp() {
    this.isSignUp = true;

    this.signUpButtonColor = this.activeButtonColor;
    this.signInButtonColor = this.passiveButtonColor;
  }

  signIn() {
    this.isSignUp = false;

    this.signInButtonColor = this.activeButtonColor;
    this.signUpButtonColor = this.passiveButtonColor;
  }

}
