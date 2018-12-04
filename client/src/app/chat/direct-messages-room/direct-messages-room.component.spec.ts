import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessagesRoomComponent } from './direct-messages-room.component';

describe('MainChatComponent', () => {
  let component: DirectMessagesRoomComponent;
  let fixture: ComponentFixture<DirectMessagesRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectMessagesRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectMessagesRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
