import {EventEmitter, Injectable, Output} from '@angular/core';
import {User} from '../model/user';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public user: User;
  @Output() public updateUser: EventEmitter<any> = new EventEmitter();

  constructor() { }

  setUser(data: any) {
    this.user = data;
  }

  getUser(): Observable<User> {
    return of(this.user);
  }
}
