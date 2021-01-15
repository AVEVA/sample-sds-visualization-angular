import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { OidcService } from '~/services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(public oidc: OidcService) {}

  /**
   * Intercepts HTTP requests and adds authorization headers from the OIDC service
   * @param request HTTP request that has been initiated
   * @param next HTTP handler for this request
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({ setHeaders: this.oidc.authHeaders });

    return next.handle(request);
  }
}
