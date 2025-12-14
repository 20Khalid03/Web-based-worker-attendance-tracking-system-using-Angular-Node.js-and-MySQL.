import { TestBed } from '@angular/core/testing';
import { UserService } from './userservice.service'; // Importer avec le nom correct

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService); // Injecter avec le nom correct
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
