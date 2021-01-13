import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(public oidcSecurityService: OidcSecurityService) {}

  /**
   * Intercepts HTTP requests and adds the Authorization header with bearer token from the OIDC security service
   * @param request HTTP request that has been initiated
   * @param next HTTP handler for this request
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.oidcSecurityService.getToken()}`,
      },
    });

    return next.handle(request);
  }
}
