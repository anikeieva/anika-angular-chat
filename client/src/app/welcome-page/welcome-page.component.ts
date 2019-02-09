import {AfterViewChecked, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild} from '@angular/core';
import {SESSION_STORAGE, StorageService} from "ngx-webstorage-service";

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent implements OnInit, AfterViewChecked {
  isSignUp: boolean = true;
  activeButtonColor: string = '#8a2ae2';
  passiveButtonColor: string = '#767676';
  signUpButtonColor: string = this.activeButtonColor;
  signInButtonColor: string = this.passiveButtonColor;
  signUpHeight: number;

  @ViewChild('sign_container') signContainer: ElementRef;

  constructor(@Inject(SESSION_STORAGE) private storage: StorageService,
              private renderer: Renderer2) {}

  ngOnInit() {}

  ngAfterViewChecked() {
    if (this.signContainer && this.isSignUp) {
      this.signUpHeight = this.signContainer.nativeElement.offsetHeight;
    } else {
      if (this.signUpHeight) {
        this.renderer.setStyle(this.signContainer.nativeElement, 'height', `${this.signUpHeight}px`);
      }
    }
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
