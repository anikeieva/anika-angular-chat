import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserParamComponent } from './edit-user-param.component';

describe('EditUserParamComponent', () => {
  let component: EditUserParamComponent;
  let fixture: ComponentFixture<EditUserParamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditUserParamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUserParamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
