import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { consumerGuard } from './consumer.guard';

describe('consumerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => consumerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
