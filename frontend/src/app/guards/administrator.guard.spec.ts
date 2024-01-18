import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { administratorGuard } from './administrator.guard';

describe('administratorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => administratorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
