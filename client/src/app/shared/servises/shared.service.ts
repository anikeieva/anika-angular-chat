import {EventEmitter, Injectable, Output} from '@angular/core';
import {User} from '../model/user';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public user: User;
  @Output() public updateUser: EventEmitter<any> = new EventEmitter();
  private listenerUser: BehaviorSubject<any> = new BehaviorSubject<any>({});

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
}
