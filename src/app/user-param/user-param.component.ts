import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';

@Component({
  selector: 'app-user-param',
  templateUrl: './user-param.component.html',
  styleUrls: ['./user-param.component.css']
})
export class UserParamComponent implements OnInit {
  public user: User;
  public userParameters: FormGroup;
  public genders: Array<string>;

  constructor(private sharedService: SharedService) {
  }

  ngOnInit() {
    this.userParameters = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl(''),
      gender: new FormControl('')
    });
    this.genders = ['male', 'female'];
  }

  isEnabledSubmit() {
    return this.userParameters.status === 'VALID';
  }

  onSubmit() {
    this.user = this.userParameters.value;
    this.user.avatar = `src/app/images/avatars/${this.user.gender}/${this.getRandomInt(3)}.png`;
    this.sharedService.setData(this.user);
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

}
