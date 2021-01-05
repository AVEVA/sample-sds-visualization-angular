import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  AppSettings,
  DEFAULT,
  DIAGNOSTICS,
  SdsNamespace,
  SdsStream,
  SdsType,
  SETTINGS,
} from '~/models';

@Injectable({ providedIn: 'root' })
export class SdsService {
  get baseUrl(): string {
    return `${this.settings.Resource}/api/${this.settings.ApiVersion}/Tenants/${this.settings.TenantId}/Namespaces`;
  }

  constructor(
    @Inject(SETTINGS) private settings: AppSettings,
    public http: HttpClient
  ) {}

  getNamespaces(): Observable<string[]> {
    if (this.settings.TenantId === DEFAULT) {
      return of([DEFAULT, DIAGNOSTICS]);
    } else {
      return this.http.get(this.baseUrl).pipe(
        map((r) => (r as SdsNamespace[]).map((n) => n.Id)),
        catchError(this.handleError('Error getting namespaces'))
      );
    }
  }

  getTypes(namespace: string): Observable<SdsType[]> {
    return this.http.get(`${this.baseUrl}/${namespace}/Types`).pipe(
      map((r) => r as SdsType[]),
      catchError(this.handleError('Error getting types'))
    );
  }

  getStreams(namespace: string, query: string): Observable<SdsStream[]> {
    return this.http
      .get(`${this.baseUrl}/${namespace}/Streams?query=${query || ''}*`)
      .pipe(
        map((r) => r as SdsStream[]),
        catchError(this.handleError('Error getting streams'))
      );
  }

  getLastValue(namespace: string, stream: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/${namespace}/Streams/${stream}/Data/Last`)
      .pipe(catchError(this.handleError('Error getting last value')));
  }

  getRangeValues(
    namespace: string,
    stream: string,
    startIndex: string,
    count: number,
    reversed = false
  ): Observable<any[]> {
    return this.http
      .get(
        `${
          this.baseUrl
        }/${namespace}/Streams/${stream}/Data?startIndex=${startIndex}&count=${count}${
          reversed ? '&reversed=true' : ''
        }`,
        {
          headers: {
            Accept: 'application/json',
            'Accept-Verbosity': 'verbose',
          },
        }
      )
      .pipe(
        map((r) => r as any[]),
        catchError(this.handleError('Error getting range values'))
      );
  }

  handleError(msg: string): (error: HttpErrorResponse) => Observable<never> {
    return (error: HttpErrorResponse): Observable<never> => {
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
      } else {
        // The SDS backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong.
        console.error(
          `SDS backend returned code ${error.status}, ` +
            `body was: ${error.error}`
        );
      }
      // Return an observable with a user-facing error message.
      return throwError(msg);
    };
  }
}
