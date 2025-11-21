import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUser().pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      } else {
        router.navigateByUrl('/auth');
        return false;
      }
    })
  );
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUser().pipe(
    take(1),
    map((user) => {
      if (user) {
        router.navigateByUrl('/tabs');
        return false;
      } else {
        return true;
      }
    })
  );
};

