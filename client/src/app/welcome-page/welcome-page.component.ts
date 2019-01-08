import {Component, OnInit} from '@angular/core';

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

  constructor() { }

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
