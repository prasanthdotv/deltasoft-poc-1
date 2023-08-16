import { TestBed } from '@angular/core/testing';

import { ThresholdSettingsService } from './threshold-settings.service';

describe('ThresholdSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThresholdSettingsService = TestBed.get(ThresholdSettingsService);
    expect(service).toBeTruthy();
  });
});
