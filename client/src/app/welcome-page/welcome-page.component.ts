import {Component, OnInit} from '@angular/core';
import {SocketService} from "../shared/servises/socket.service";

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent implements OnInit {

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.socketService.initSocket();
  }

}
