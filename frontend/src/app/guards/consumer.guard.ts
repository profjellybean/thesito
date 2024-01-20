import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";

export const consumerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  return authService.isConsumer() || authService.isAdministrator();
};
