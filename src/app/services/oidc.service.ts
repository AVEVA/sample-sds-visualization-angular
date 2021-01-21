import { Inject, Injectable } from '@angular/core';
import { User, UserManager } from 'oidc-client';
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
    });
  }

  /** Start the login process */
  login(): void {
    this.mgr.signinRedirect();
  }

  /** Start the logout process */
  logout(): void {
    this.mgr.signoutRedirect();
  }

  /** Handle an OIDC redirect callback, and set auth headers */
  signinRedirectCallback(): Observable<User> {
    return from(this.mgr.signinRedirectCallback()).pipe(
      tap((user) => this.setAuthHeaders(user))
    );
  }

  /** Handle an OIDC silent redirect callback, and set auth headers */
  signinSilentCallback(): Observable<User> {
    return from(this.mgr.signinSilentCallback()).pipe(
      tap((user) => this.setAuthHeaders(user))
    );
  }

  /** Get the already logged in user, and set auth headers */
  getUser(): Observable<User> {
    return from(this.mgr.getUser()).pipe(
      tap((user) => this.setAuthHeaders(user))
    );
  }

  /** Check whether there is a valid logged in user */
  checkAuth(): Observable<boolean> {
    return this.getUser().pipe(
      map((user) => user != null && !user.expired),
      catchError(() => of(false))
    );
  }

  /** Set auth headers for use with http requests */
  setAuthHeaders(user: User): void {
    this.authHeaders = user && {
      Authorization: `${user.token_type} ${user.access_token}`,
    };
  }
}
