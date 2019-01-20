import {Component, Inject, OnInit} from '@angular/core';
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";
import {SocketService} from "../shared/servises/socket.service";

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent implements OnInit {
  public isSignUp: boolean = true;
  public activeButtonColor: string = '#8a2ae2';
  public passiveButtonColor: string = '#767676';
  public signUpButtonColor: string = this.activeButtonColor;
  public signInButtonColor: string = this.passiveButtonColor;

  constructor(@Inject(SESSION_STORAGE) private storage: StorageService) {}

  ngOnInit() {
    console.log('welcome init');
    this.storage.clear();
  }

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
