import { TestBed } from '@angular/core/testing';

import { VerticalStackedChartService } from './vertical-stacked-chart.service';

describe('VerticalStackedChartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VerticalStackedChartService = TestBed.get(VerticalStackedChartService);
    expect(service).toBeTruthy();
  });
});
