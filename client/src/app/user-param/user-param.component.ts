import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {UserAction} from '../shared/model/userAction';
import {MatDialog} from "@angular/material";
import {ChooseAvatarComponent} from "../choose-avatar/choose-avatar.component";
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {USER_STORAGE_TOKEN} from "../shared/model/userStorageToken";
import {SocketService} from "../shared/servises/socket.service";

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
  @Input() userBeforeEdit: User;
  private currentAction: UserAction;
  public selectedAvatar: string | ArrayBuffer;
  private userParametersBeforeEdit: User;

  constructor(private sharedService: SharedService,
              private dialog: MatDialog,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService) {
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
      console.log(this.userBeforeEdit);

      this.userParameters.setValue({
        firstName: this.userBeforeEdit.firstName,
        lastName: this.userBeforeEdit.lastName,
        gender: this.userBeforeEdit.gender,
        login: this.userBeforeEdit.login,
        password: this.userBeforeEdit.password
      });
      console.log('user-param init:',this.userParameters.value);
      this.userParametersBeforeEdit = this.userParameters.value;
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

    this.socketService.sendUser(this.user);
    this.sharedService.setUser(this.user);
    this.sharedService.updateUser.emit(this.user);

    this.storage.set(USER_STORAGE_TOKEN, this.user);
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  onSave() {
    console.log(this.userBeforeEdit);
    console.log(this.userParametersBeforeEdit);
    this.currentAction = this.userBeforeEdit.action;
    this.user = this.userBeforeEdit;

    for (let key in this.user) {
      if (this.userParameters.value[key] !== undefined) {
        this.user[key] = this.userParameters.value[key];
      }
    }
    console.log('bef: ', this.user);

    if (this.userParametersBeforeEdit.gender !== this.user.gender) {
      this.user.avatar = `src/app/images/avatars/${this.user.gender}/${this.getRandomInt(3)}.png`;
    }

    this.user.action = this.currentAction;
    this.user.action.edit = true;

    console.log('bef2: ', this.user);

    this.socketService.sendUser(this.user);

    console.log(this.user);


    const param: object = {
      paramBefore: this.userParametersBeforeEdit,
      paramAfter: this.user
    }
    this.sharedService.editUser(param);

    this.storage.set(USER_STORAGE_TOKEN, this.user);
  }

  isChecked(gender: string) {
    if (this.isEdit) {
      return (this.userBeforeEdit.gender === gender);
    }
    return false;
  }

  onSelectAvatar(event) {
    const fileReader = new FileReader();
    const file = event.target.files[0];
    console.log(event);

    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      this.selectedAvatar = fileReader.result;

      if (!this.user) {
        this.user = this.userBeforeEdit;
      }

      this.user.avatar = this.selectedAvatar;

      console.log('user, own avatar:', this.user);
      this.socketService.sendUser(this.user);
      this.storage.set(USER_STORAGE_TOKEN, this.user);
      this.sharedService.editUser(null);
    };
  }

  chooseAvatar() {
    const dialogRef = this.dialog.open(ChooseAvatarComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }
}
