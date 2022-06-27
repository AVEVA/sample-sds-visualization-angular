import { Inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AppSettings, DEFAULT, SETTINGS } from '~/models';
import { OidcService } from '~/services';

@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  get frameElement(): Element | boolean {
    return window.frameElement;
  }

  constructor(
    @Inject(SETTINGS) public settings: AppSettings,
    public router: Router,
    public oidc: OidcService
  ) {}

  /** Determines whether the user is authenticated, or data source is EDS and user does not need to be authenticated */
  canActivate(): Observable<boolean> {
    if (this.settings.TenantId !== DEFAULT) {
      // Data source is ADH, check OIDC service auth
      return this.oidc.checkAuth().pipe(
        switchMap((isAuthenticated) => {
          if (isAuthenticated) {
            // OIDC service is already authenticated, return true
            return of(true);
          } else {
            // OIDC service is not authenticated yet; check for callback
            // If window is in a frame, this means we should use silent callback, otherwise use redirect callback
            const signinCallback = this.frameElement
              ? this.oidc.signinSilentCallback()
              : this.oidc.signinRedirectCallback();
            return signinCallback.pipe(
              map(() => {
                // Callback succeeded, navigate back to root
                this.router.navigate([]);
                return true;
              }),
              catchError(() => {
                // Callback failed, tell service to start login
                this.oidc.login();
                return of(false);
              })
            );
          }
        })
      );
    }
    // Data source is EDS, bypass OAuth and return true
    return of(true);
  }
}
