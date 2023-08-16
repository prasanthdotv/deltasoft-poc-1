import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalTableComponent } from './normal-table.component';

describe('NormalTableComponent', () => {
  let component: NormalTableComponent;
  let fixture: ComponentFixture<NormalTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NormalTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
