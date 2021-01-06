import { Injectable } from '@angular/core';
import { AuthOptions } from 'angular-auth-oidc-client/lib/login/auth-options';
import { Observable } from 'rxjs';

// Do not test mock classes
// istanbul ignore next
@Injectable({ providedIn: 'root' })
export class MockOidcSecurityService {
  authorize(authOptions?: AuthOptions): void {}
  checkAuth(url?: string): Observable<boolean> {
    return null;
  }
}
