import { CanActivateFn } from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";

export const administratorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  return authService.isAdministrator()
};
