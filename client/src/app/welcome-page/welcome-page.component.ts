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
  public isSignUp: boolean = true;
  public activeButtonColor: string = '#8a2ae2';
  public passiveButtonColor: string = '#767676';
  public activeButtonBackground: string = '#9300ff05';
  public passiveButtonBackground: string = 'white';
  public signUpButtonColor: string = this.activeButtonColor;
  public signInButtonColor: string = this.passiveButtonColor;
  public signUpButtonBackground: string = this.activeButtonBackground;
  public signInButtonBackground: string = this.passiveButtonBackground;

  constructor(private socketService: SocketService,
              @Inject(SESSION_STORAGE) private storage: StorageService) { }

  ngOnInit() {
    this.storage.remove(USER_STORAGE_TOKEN);
    this.socketService.initSocket();
  }

  signUp() {
    this.isSignUp = true;

    this.signUpButtonColor = this.activeButtonColor;
    this.signInButtonColor = this.passiveButtonColor;

    this.signUpButtonBackground = this.activeButtonBackground;
    this.signInButtonBackground = this.passiveButtonBackground;
  }

  signIn() {
    this.isSignUp = false;

    this.signInButtonColor = this.activeButtonColor;
    this.signUpButtonColor = this.passiveButtonColor;

    this.signInButtonBackground = this.activeButtonBackground;
    this.signUpButtonBackground = this.passiveButtonBackground;
  }

}
