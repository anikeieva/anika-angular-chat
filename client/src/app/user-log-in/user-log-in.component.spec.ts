import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLogInComponent } from './user-log-in.component';

describe('UserLogInComponent', () => {
  let component: UserLogInComponent;
  let fixture: ComponentFixture<UserLogInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserLogInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLogInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
