import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HexagonalChartComponent } from './hexagonal-chart.component';

describe('HexagonalChartComponent', () => {
  let component: HexagonalChartComponent;
  let fixture: ComponentFixture<HexagonalChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HexagonalChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HexagonalChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
