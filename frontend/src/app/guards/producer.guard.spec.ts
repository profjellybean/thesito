import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { producerGuard } from './producer.guard';

describe('producerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => producerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
