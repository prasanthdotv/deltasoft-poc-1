import { TestBed } from '@angular/core/testing';

import { LineChartService } from './line-chart.service';

describe('LineChartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LineChartService = TestBed.get(LineChartService);
    expect(service).toBeTruthy();
  });
});
