import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {UserAction} from '../shared/model/userAction';
import {MatDialog} from "@angular/material";
import {ChooseAvatarComponent} from "../choose-avatar/choose-avatar.component";

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
  public selectedAvatar: string | ArrayBuffer;

  constructor(private sharedService: SharedService,
              private dialog: MatDialog) {
    this.getUserParams();
    this.genders = ['male', 'female'];
  }

  private getUserParams() {
    this.userParameters = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl(''),
      gender: new FormControl(''),
      login: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    if (this.isEdit) {
      this.userParameters.setValue({
        firstName: this.userParam.firstName,
        lastName: this.userParam.lastName,
        gender: this.userParam.gender,
        login: this.userParam.login,
        password: this.userParam.password
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

  onSelectAvatar(event) {
    const fileReader = new FileReader();
    const file = event.target.files[0];

    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      this.selectedAvatar = fileReader.result;

      if (!this.user) {
        this.user = this.userParam;
      }
      console.log(this.user);
      console.log(this.selectedAvatar);
      this.user.avatar = this.selectedAvatar;
      this.sharedService.setUser(this.user);
      this.sharedService.updateUser.emit(this.user);
      console.log(this.user);
    };
  }

  chooseAvatar() {
    const dialogRef = this.dialog.open(ChooseAvatarComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }
}
