import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDateSelectorComponent } from './custom-date-selector.component';

describe('CustomDateSelectorComponent', () => {
  let component: CustomDateSelectorComponent;
  let fixture: ComponentFixture<CustomDateSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomDateSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDateSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
