import { Injectable } from '@angular/core';
import {User} from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private user: User;

  constructor() { }

  setData(data: any) {
    this.user = data;
  }

  getData() {
    return this.user;
  }
}
