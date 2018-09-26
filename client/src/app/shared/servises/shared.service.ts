import {EventEmitter, Injectable, Output} from '@angular/core';
import {User} from '../model/user';
import {Observable, of, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public user: User;
  @Output() public updateUser: EventEmitter<any> = new EventEmitter();
  private listenerUser = new Subject<any>();

  constructor() { }

  listenUser(): Observable<any> {
    return this.listenerUser.asObservable();
  }

  editUser(event: Event) {
    this.listenerUser.next(event);
  }

  setUser(data: any) {
    this.user = data;
  }

  getUser(): Observable<User> {
    return of(this.user);
  }
}
