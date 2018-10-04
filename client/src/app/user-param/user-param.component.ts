import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {UserAction} from '../shared/model/userAction';

@Component({
  selector: 'app-user-param',
  templateUrl: './user-param.component.html',
  styleUrls: ['./user-param.component.css']
})
export class UserParamComponent implements OnInit {
  public user: User;
  public userParameters: FormGroup;
  public genders: Array<string>;
  @Input() title: string;
  @Input() submitTitle: string;
  @Input() isEdit: boolean;
  @Input() userParam: User;
  private currentAction: UserAction;

  constructor(private sharedService: SharedService) {
    this.getUserParams();
    this.genders = ['male', 'female'];
  }

  private getUserParams() {
    this.userParameters = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl(''),
      gender: new FormControl('')
    });
  }

  ngOnInit() {
    if (this.isEdit) {
      this.userParameters.setValue({
        firstName: this.userParam.firstName,
        lastName: this.userParam.lastName,
        gender: this.userParam.gender
      });
      console.log('user-param init:',this.userParameters.value);
    }
  }

  isEnabledSubmit() {
    return this.userParameters.status === 'VALID';
  }

  onSubmit() {
    this.user = this.userParameters.value;
    this.user.avatar = `src/app/images/avatars/${this.user.gender}/${this.getRandomInt(3)}.png`;
    this.user.action = {
      signed: true,
      edit: false,
      joined: false,
      sentMessage: false
    };
    this.sharedService.setUser(this.user);
    this.sharedService.updateUser.emit(this.user);
    console.log('onSubmit this.user: ',this.user);
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  onSave() {
    this.currentAction = this.userParam.action;
    this.user = this.userParameters.value;

    if (this.user.gender === this.userParam.gender) {
      this.user.avatar = this.userParam.avatar;
    } else {
      this.user.avatar = `src/app/images/avatars/${this.user.gender}/${this.getRandomInt(3)}.png`;
    }

    this.user.action = this.currentAction;
    this.user.action.edit = true;

    this.sharedService.setUser(this.user);
    this.sharedService.updateUser.emit(this.user);
    const param: object = {
      paramBefore: this.userParam,
      paramAfter: this.user
    }
    this.sharedService.editUser(param);
  }

  isChecked(gender: string) {
    if (this.isEdit) {
      return (this.userParam.gender === gender);
    }
    return false;
  }

}