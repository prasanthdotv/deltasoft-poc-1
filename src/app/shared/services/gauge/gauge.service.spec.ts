import { TestBed } from '@angular/core/testing';

import { GaugeService } from './gauge.service';

describe('GaugeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GaugeService = TestBed.get(GaugeService);
    expect(service).toBeTruthy();
  });
});
