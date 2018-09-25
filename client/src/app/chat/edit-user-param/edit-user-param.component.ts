import {Component, OnInit} from '@angular/core';
import {SharedService} from '../../shared/servises/shared.service';
import {User} from '../../shared/model/user';

@Component({
  selector: 'app-edit-user-param',
  templateUrl: './edit-user-param.component.html',
  styleUrls: ['./edit-user-param.component.css']
})

export class EditUserParamComponent implements OnInit {
  public user: User;

  constructor(private sharedService: SharedService) { }

  ngOnInit() {
    this.sharedService.getUser().subscribe(user => this.user = user);
  }



}
