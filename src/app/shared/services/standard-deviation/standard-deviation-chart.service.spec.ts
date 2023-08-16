import { TestBed } from '@angular/core/testing';

import { StandardDeviationChartService } from './standard-deviation-chart.service';

describe('StandardDeviationChartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StandardDeviationChartService = TestBed.get(StandardDeviationChartService);
    expect(service).toBeTruthy();
  });
});
