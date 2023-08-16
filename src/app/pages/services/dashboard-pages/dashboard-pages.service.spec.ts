import { TestBed } from '@angular/core/testing';

import { DashboardPagesService } from './dashboard-pages.service';

describe('PageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardPagesService = TestBed.get(DashboardPagesService);
    expect(service).toBeTruthy();
  });
});
