import { TestBed } from '@angular/core/testing';

import { VerticalBarChartService } from './vertical-bar-category-chart.service';

describe('VerticalBarChartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VerticalBarChartService = TestBed.get(VerticalBarChartService);
    expect(service).toBeTruthy();
  });
});
