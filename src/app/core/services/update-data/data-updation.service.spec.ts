import { TestBed } from '@angular/core/testing';

import { DataUpdateService } from './data-updation.service';

describe('DataUpdateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataUpdateService = TestBed.get(DataUpdateService);
    expect(service).toBeTruthy();
  });
});
