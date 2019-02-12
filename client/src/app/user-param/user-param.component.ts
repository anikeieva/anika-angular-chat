import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../shared/model/user';
import {SharedService} from '../shared/servises/shared.service';
import {UserAction} from '../shared/model/userAction';
import {MatDialog} from "@angular/material";
import {ChooseAvatarComponent} from "../choose-avatar/choose-avatar.component";
import {SESSION_STORAGE, StorageService} from 'ngx-webstorage-service';
import {SocketService} from "../shared/servises/socket.service";
import {currentUserToken, getUserStorageToken} from "../shared/model/getStorageToken";
import {Router} from "@angular/router";
import {AvatarCropperComponent} from "./avatar-cropper/avatar-cropper.component";
import {Message} from "../shared/model/message";

@Component({
  selector: 'app-user-param',
  templateUrl: './user-param.component.html',
  styleUrls: ['./user-param.component.css']
})
export class UserParamComponent implements OnInit {
  user: User;
  userParameters: FormGroup;
  genders: Array<string>;
  @Input() title: string;
  @Input() submitTitle: string;
  @Input() isEdit: boolean;
  @Input() userBeforeEdit: User;
  private currentAction: UserAction;
  private userParametersBeforeEdit: User;
  userToken: string;
  userIsAuthorized: boolean;
  imageChangedEvent: any = '';

  constructor(private sharedService: SharedService,
              private dialog: MatDialog,
              @Inject(SESSION_STORAGE) private storage: StorageService,
              private  socketService: SocketService,
              private router: Router) {
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

    this.userIsAuthorized = true;

    if (this.isEdit) {

      this.userParameters.setValue({
        firstName: this.userBeforeEdit.firstName,
        lastName: this.userBeforeEdit.lastName,
        gender: this.userBeforeEdit.gender,
        login: this.userBeforeEdit.login,
        password: null
      });

      this.userParameters.removeControl(this.userParameters.value.password);
      this.userParametersBeforeEdit = this.userParameters.value;

    }

  }

  isEnabledSubmit() {
    return this.userParameters.status === 'VALID';
  }

  onSubmit() {
    this.user = this.userParameters.value;
    this.user.avatar = `src/app/images/avatars/${this.user.gender}/${UserParamComponent.getRandomInt(3)}.png`;
    this.user.action = {
      signed: true,
      edit: false,
      joined: false,
      sentMessage: false
    };
    this.user.online = true;

    if (!this.socketService.socket) this.socketService.initSocket();
    this.socketService.sendUser(this.user);


    this.socketService.onUserSignUp().subscribe((user) => {
      if (user) {
        this.userIsAuthorized = true;
        this.storage.set(currentUserToken, user.id);
        this.userToken = getUserStorageToken(user.id);
        this.storage.set(this.userToken, JSON.stringify(user));
      }
      this.router.navigateByUrl('/chat');
    });

    this.socketService.onUserNotSignUp().subscribe((userNotSignUp) => {
      if (userNotSignUp) {
        this.userIsAuthorized = false;
      }
    });
  }

  private static getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  onSave() {
    this.currentAction = this.userBeforeEdit.action;
    this.user = this.userBeforeEdit;

    for (let key in this.user) {
      if (this.userParameters.value[key] !== undefined) {
        this.user[key] = this.userParameters.value[key];
      }
    }

    if (this.userParametersBeforeEdit.gender !== this.user.gender) {
      this.user.avatar = `src/app/images/avatars/${this.user.gender}/${UserParamComponent.getRandomInt(3)}.png`;
    }

    this.user.action = this.currentAction;
    this.user.action.edit = true;
    this.userToken = getUserStorageToken(this.user.id);

    // const param: object = {
    //   paramBefore: this.userParametersBeforeEdit,
    //   paramAfter: this.user
    // };

    if (!this.socketService.socket) this.socketService.initSocket();

    this.socketService.sendUser(this.user);
    if (this.user.action.joined) this.socketService.sendChatRoomUser(this.user); // to split later
    // this.sharedService.editUser(param);
    this.storage.set(this.userToken, JSON.stringify(this.user));

    this.socketService.sendNotificationAboutEditUser(this.userParametersBeforeEdit, this.user);
  }

  isChecked(gender: string) {
    if (this.isEdit) return (this.userBeforeEdit.gender === gender);
    else return false;
  }

  onSelectAvatar(event) {
    this.imageChangedEvent = event;
    if (!this.user) this.user = this.userBeforeEdit;
    this.dialog.open(AvatarCropperComponent, {data: {user: this.user, event: event}});
  }

  chooseAvatar() {
    this.dialog.open(ChooseAvatarComponent);
  }
}
