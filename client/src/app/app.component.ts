import {Component, OnInit} from '@angular/core';
import {BreakpointObserver} from "@angular/cdk/layout";
import {Router, RoutesRecognized} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public isChatRoomActive: boolean;
  public isMobile: boolean;

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router) {}

  ngOnInit() {
    this.isMobile = this.breakpointObserver.isMatched('(max-width: 600px)');

    this.router.events.subscribe(event => {

      if (event instanceof RoutesRecognized) {
        this.isChatRoomActive = event.url.includes('main') ||
          event.url.includes('room') ||
          event.url.includes('profile');
      }

    });
  }
}
