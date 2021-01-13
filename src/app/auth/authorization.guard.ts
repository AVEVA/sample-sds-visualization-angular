import { Inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, of } from 'rxjs';

import { AppSettings, DEFAULT, SETTINGS } from '~/models';

@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  constructor(
    private oidcSecurityService: OidcSecurityService,
    @Inject(SETTINGS) public settings: AppSettings
  ) {}

  /** Determines whether the user is authenticated, or data source is EDS and user does not need to be authenticated */
  canActivate(): Observable<boolean> {
    if (this.settings.TenantId !== DEFAULT) {
      return this.oidcSecurityService.isAuthenticated$;
    }
    return of(true);
  }
}
