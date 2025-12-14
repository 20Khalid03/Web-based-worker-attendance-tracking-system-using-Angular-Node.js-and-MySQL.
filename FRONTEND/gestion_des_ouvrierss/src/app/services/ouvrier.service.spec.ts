import { TestBed } from '@angular/core/testing';

import { OuvrierService } from './ouvrier.service';

describe('OuvrierService', () => {
  let service: OuvrierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OuvrierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
