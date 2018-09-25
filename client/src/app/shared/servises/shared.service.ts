import {EventEmitter, Injectable, Output} from '@angular/core';
import {User} from '../model/user';
import {Observable, of, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public user: User;
  @Output() public updateUser: EventEmitter<any> = new EventEmitter();
  private _listeners = new Subject<any>();

  constructor() { }

  listen(): Observable<any> {
    return this._listeners.asObservable();
  }

  editUser(event: Event) {
    this._listeners.next(event);
  }

  setUser(data: any) {
    this.user = data;
  }

  getUser(): Observable<User> {
    return of(this.user);
  }
}
