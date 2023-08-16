import { TestBed } from '@angular/core/testing';

import { MultiAxisLineChartService } from './multi-axis-line-chart.service';

describe('MultiAxisLineChartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultiAxisLineChartService = TestBed.get(MultiAxisLineChartService);
    expect(service).toBeTruthy();
  });
});
