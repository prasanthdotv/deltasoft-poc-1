import { TestBed } from '@angular/core/testing';

import { DialChartService } from './dial-chart.service';

describe('DialChartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DialChartService = TestBed.get(DialChartService);
    expect(service).toBeTruthy();
  });
});
