import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiAxisLineChartComponent } from './multi-axis-line-chart.component';

describe('MultiAxisLineChartComponent', () => {
  let component: MultiAxisLineChartComponent;
  let fixture: ComponentFixture<MultiAxisLineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiAxisLineChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiAxisLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
