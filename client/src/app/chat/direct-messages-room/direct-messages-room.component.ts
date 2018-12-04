import {
  Component,
  OnInit,
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {User} from "../../shared/model/user";

@Component({
  selector: 'app-direct-messages-room',
  templateUrl: './direct-messages-room.component.html',
  styleUrls: ['./direct-messages-room.component.css']
})
export class DirectMessagesRoomComponent implements OnInit {

  public user: User;

  constructor( private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.user = JSON.parse(param.currentUser);
    });

    console.log('user: ',this.user);
  }
}
