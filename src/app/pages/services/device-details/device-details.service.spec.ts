import { TestBed } from '@angular/core/testing';

import { DeviceDetailsService } from './device-details.service';

describe('DeviceDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeviceDetailsService = TestBed.get(DeviceDetailsService);
    expect(service).toBeTruthy();
  });
});
