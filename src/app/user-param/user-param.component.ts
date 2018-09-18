import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-user-param',
  templateUrl: './user-param.component.html',
  styleUrls: ['./user-param.component.css']
})
export class UserParamComponent implements OnInit {

  public user;
  public userParameters = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    gender: new FormControl('')
  });
  public genders = ['male', 'female'];

  constructor() { }

  ngOnInit() {
  }

  onSubmit() {
    this.user = this.userParameters.value;
  }

}
