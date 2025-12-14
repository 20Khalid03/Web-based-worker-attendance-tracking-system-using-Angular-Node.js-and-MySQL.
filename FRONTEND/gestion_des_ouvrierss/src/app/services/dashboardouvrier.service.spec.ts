import { TestBed } from '@angular/core/testing';

import { DashboardouvrierService } from './dashboardouvrier.service';

describe('DashboardouvrierService', () => {
  let service: DashboardouvrierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardouvrierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
