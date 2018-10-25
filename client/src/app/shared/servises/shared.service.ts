import {EventEmitter, Inject, Injectable, Output} from '@angular/core';
import {User} from '../model/user';
import {BehaviorSubject, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public user: User;
  @Output() public updateUser: EventEmitter<any> = new EventEmitter();
  private listenerUser: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor() {
  }

  listenUser(): Observable<any> {
    return this.listenerUser.asObservable();
  }

  editUser(param): void {
    this.listenerUser.next(param);
  }

  editUserClear(): void {
    this.listenerUser.next(null);
  }

  setUser(data: any) {
    this.user = data;
  }

  getUser(): Observable<User> {
    return of(this.user);
  }
}
