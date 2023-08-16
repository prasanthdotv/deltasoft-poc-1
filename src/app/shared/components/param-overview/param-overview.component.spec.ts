import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamOverviewComponent } from './param-overview.component';

describe('ParamOverviewComponent', () => {
  let component: ParamOverviewComponent;
  let fixture: ComponentFixture<ParamOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParamOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
