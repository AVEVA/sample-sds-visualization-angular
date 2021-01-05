import { Injectable } from '@angular/core';
import { AuthOptions } from 'angular-auth-oidc-client/lib/login/auth-options';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockOidcSecurityService {
  authorize(authOptions?: AuthOptions): void {}
  checkAuth(url?: string): Observable<boolean> {
    return null;
  }
}
