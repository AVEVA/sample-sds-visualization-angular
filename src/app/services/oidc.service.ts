import { Inject, Injectable } from '@angular/core';
import { User, UserManager, WebStorageStateStore } from 'oidc-client';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AppSettings, SETTINGS } from '~/models';

@Injectable({ providedIn: 'root' })
export class OidcService {
  mgr: UserManager;
  authHeaders: Record<string, string | string[]>;

  constructor(@Inject(SETTINGS) public settings: AppSettings) {
    this.mgr = new UserManager({
      authority: `${settings.Resource}/identity`,
      client_id: settings.ClientId,
      response_type: 'code',
      scope: 'openid ocsapi',
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin,
      acr_values: `tenant:${settings.TenantId}`,
      silent_redirect_uri: window.location.origin,
      automaticSilentRenew: true,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    });
  }

  login(): void {
    this.mgr.signinRedirect();
  }

  logout(): void {
    this.mgr.signoutRedirect();
  }

  signinRedirectCallback(): Observable<User> {
    return from(this.mgr.signinRedirectCallback()).pipe(
      tap((user) => this.setAuthHeaders(user))
    );
  }

  signinSilentCallback(): Observable<User> {
    return from(this.mgr.signinSilentCallback());
  }

  getUser(): Observable<User> {
    return from(this.mgr.getUser()).pipe(
      tap((user) => this.setAuthHeaders(user))
    );
  }

  checkAuth(): Observable<boolean> {
    return this.getUser().pipe(
      map((user) => user != null),
      catchError(() => of(false))
    );
  }

  setAuthHeaders(user: User): void {
    this.authHeaders = user && {
      Authorization: `${user.token_type} ${user.access_token}`,
    };
  }
}
