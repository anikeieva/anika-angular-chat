import { Injectable } from '@angular/core';
import {User} from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private user: User;

  constructor() { }

  setUser(data: any) {
    this.user = data;
  }

  getUser() {
    return this.user;
  }
}
