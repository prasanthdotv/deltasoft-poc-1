import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicTitleComponent } from './basic-title.component';

describe('BasicTitleComponent', () => {
  let component: BasicTitleComponent;
  let fixture: ComponentFixture<BasicTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
