import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseMessageManipulatingComponent } from './choose-message-manipulating.component';

describe('ChooseMessageManipulatingComponent', () => {
  let component: ChooseMessageManipulatingComponent;
  let fixture: ComponentFixture<ChooseMessageManipulatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseMessageManipulatingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseMessageManipulatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
