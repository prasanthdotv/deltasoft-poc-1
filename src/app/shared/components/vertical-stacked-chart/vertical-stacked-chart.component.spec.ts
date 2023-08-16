import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalStackedChartComponent } from './vertical-stacked-chart.component';

describe('VerticalStackedChartComponent', () => {
  let component: VerticalStackedChartComponent;
  let fixture: ComponentFixture<VerticalStackedChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerticalStackedChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalStackedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
