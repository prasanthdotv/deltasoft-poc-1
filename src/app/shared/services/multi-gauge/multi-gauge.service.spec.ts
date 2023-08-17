import { TestBed } from '@angular/core/testing';

import { MultiGaugeService } from './multi-gauge.service';

describe('MultiGaugeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultiGaugeService = TestBed.get(MultiGaugeService);
    expect(service).toBeTruthy();
  });
});
