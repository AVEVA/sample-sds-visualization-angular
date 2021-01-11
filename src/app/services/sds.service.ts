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
    @Inject(SETTINGS) public settings: AppSettings,
    public http: HttpClient
  ) {}

  edsNamespace(id: string): SdsNamespace {
    return {
      Id: id,
      Description: '',
      InstanceId: '',
      Region: '',
      Self: `${this.baseUrl}/${id}`,
    };
  }

  getNamespaces(): Observable<SdsNamespace[]> {
    if (this.settings.TenantId === DEFAULT) {
      return of([this.edsNamespace(DEFAULT), this.edsNamespace(DIAGNOSTICS)]);
    } else {
      return this.http.get(this.baseUrl).pipe(
        map((r) => r as SdsNamespace[]),
        catchError(this.handleError('Error getting namespaces'))
      );
    }
  }

  getTypes(namespace: SdsNamespace): Observable<SdsType[]> {
    return this.http.get(`${namespace.Self}/Types`).pipe(
      map((r) => r as SdsType[]),
      catchError(this.handleError('Error getting types'))
    );
  }

  getStreams(namespace: SdsNamespace, query: string): Observable<SdsStream[]> {
    return this.http
      .get(`${namespace.Self}/Streams?query=${query || ''}*`)
      .pipe(
        map((r) => r as SdsStream[]),
        catchError(this.handleError('Error getting streams'))
      );
  }

  getLastValue(namespace: SdsNamespace, stream: string): Observable<any> {
    return this.http
      .get(`${namespace.Self}/Streams/${stream}/Data/Last`)
      .pipe(catchError(this.handleError('Error getting last value')));
  }

  getRangeValues(
    namespace: SdsNamespace,
    stream: string,
    startIndex: string,
    count: number,
    reversed = false
  ): Observable<any[]> {
    return this.http
      .get(
        `${
          namespace.Self
        }/Streams/${stream}/Data?startIndex=${startIndex}&count=${count}${
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
