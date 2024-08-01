import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  AppSettings,
  DEFAULT,
  DIAGNOSTICS,
  OrganizationUnit,
  OrganizationUnitType,
  SdsCommunity,
  SdsNamespace,
  SdsResolvedStream,
  SdsStream,
  SdsType,
  SETTINGS,
} from '~/models';

@Injectable({ providedIn: 'root' })
export class SdsService {
  /** The base URL for namespaces in the SDS instance and tenant */
  get baseUrl(): string {
    return `${this.settings.Resource}/api/${this.settings.ApiVersion}`;
  }
  get baseTenantUrl(): string {
    return `${this.baseUrl}/Tenants/${this.settings.TenantId}`;
  }

  /** The base preview URL for namespaces in the SDS instance and tenant */
  get basePreviewUrl(): string {
    return `${this.settings.Resource}/api/${this.settings.ApiVersion}-preview`;
  }
  get basePreviewTenantUrl(): string {
    return `${this.baseUrl}/Tenants/${this.settings.TenantId}`;
  }

  constructor(
    @Inject(SETTINGS) public settings: AppSettings,
    public http: HttpClient
  ) {}

  /**
   * Creates a representation of an EDS namespace as a full SDS Namespace object
   * @param id The ID of the EDS namespace, 'default' or 'diagnostics'
   */
  edsNamespace(id: typeof DEFAULT | typeof DIAGNOSTICS): OrganizationUnit {
    return {
      Unit: {
        Id: id,
        Name: id,
        Description: '',
        InstanceId: '',
        Region: '',
        Self: `${this.baseTenantUrl}/Namespaces/${id}`,
      },
      Type: OrganizationUnitType.Namespace,
    };
  }

  /**
   * Makes an HTTP request for list of communities from Cds, see
   * {@link https://docs.osisoft.com/bundle/data-hub/page/api-reference/community/community-communities.html
   * |Cds Documentation}
   */
  getCommunities(): Observable<OrganizationUnit[]> {
    if (this.settings.TenantId === DEFAULT) {
      return of([]);
    } else {
      return this.http.get(`${this.basePreviewUrl}/Communities`).pipe(
        map((r) =>
          (r as SdsCommunity[]).map((r) => {
            return { Unit: r, Type: OrganizationUnitType.Community };
          })
        ),
        catchError(this.handleError('Error getting communities'))
      );
    }
  }

  /**
   * Gets hard-coded namespaces from EDS, or makes an HTTP request for list of namespaces from Cds, see
   * {@link https://docs.osisoft.com/bundle/data-hub/page/api-reference/tenant/tenant-namespaces.html
   * |Cds Documentation}
   */
  getNamespaces(): Observable<OrganizationUnit[]> {
    if (this.settings.TenantId === DEFAULT) {
      return of([this.edsNamespace(DEFAULT), this.edsNamespace(DIAGNOSTICS)]);
    } else {
      return this.http.get(`${this.baseTenantUrl}/Namespaces`).pipe(
        map((r) =>
          (r as SdsNamespace[]).map((r) => {
            return { Unit: r, Type: OrganizationUnitType.Namespace };
          })
        ),
        catchError(this.handleError('Error getting namespaces'))
      );
    }
  }

  /**
   * Makes a request for streams in a specified namespace/community matching a search pattern, see
   * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/SequentialDataStore/SDS_Streams.html#get-streams| Cds Documentation}
   * and {@link https://osisoft.github.io/Edge-Data-Store-Docs/V1/SDS/Streams/Sds_Streams_API_1-0.html#get-streams| EDS Documentation}
   * @param unit The namespace/community to query streams against
   * @param query The string search for streams
   */
  getStreams(unit: OrganizationUnit, query: string): Observable<SdsStream[]> {
    if (unit.Type === OrganizationUnitType.Namespace) {
      return this.http
        .get(
          `${(unit.Unit as SdsNamespace).Self}/Streams?query=${query || ''}*`
        )
        .pipe(
          map((r) => r as SdsStream[]),
          catchError(this.handleError('Error getting streams'))
        );
    } else {
      return this.http
        .get(
          `${this.settings.Resource}/api/${
            this.settings.ApiVersion
          }-preview/Search/Communities/${unit.Unit.Id}/Streams?query=${
            query || ''
          }*`,
          { headers: new HttpHeaders().set('Community-Id', unit.Unit.Id) }
        )
        .pipe(
          map((r) => r as SdsStream[]),
          catchError(this.handleError('Error getting streams'))
        );
    }
  }

  /**
   * Makes a request for type of a specified stream
   * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/SequentialDataStore/SDS_Types.html#get-types|Cds Documentation} and
   * {@link https://osisoft.github.io/Edge-Data-Store-Docs/V1/SDS/Types/SDSType_API_1-0.html#get-types|EDS Documentation}
   * @param unit The namespace/community to query types against
   * @param stream The stream to query a type for
   */
  getType(unit: OrganizationUnit, stream: SdsStream): Observable<SdsType> {
    if (this.settings.TenantId === DEFAULT) {
      return this.http
        .get(
          `${this.baseTenantUrl}/Namespaces/${unit.Unit.Id}/Types/${stream.TypeId}`
        )
        .pipe(
          map((r) => r as SdsType),
          catchError(this.handleError('Error getting type'))
        );
    } else if (unit.Type === OrganizationUnitType.Namespace) {
      return this.http
        .get(
          `${(unit.Unit as SdsNamespace).Self}/Streams/${stream.Id}/Resolved`
        )
        .pipe(
          map((r) => (r as SdsResolvedStream).Type),
          catchError(this.handleError('Error getting type'))
        );
    } else {
      return this.http
        .get(`${stream.Self}/Resolved`, {
          headers: new HttpHeaders().set('Community-Id', unit.Unit.Id),
        })
        .pipe(
          map((r) => (r as SdsResolvedStream).Type),
          catchError(this.handleError('Error getting type'))
        );
    }
  }

  /**
   * Makes a request for the latest value from a stream in a specified namespace, see
   * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/SequentialDataStore/Reading_Data_API.html#get-last-value
   * |Cds Documentation} and
   * {@link https://osisoft.github.io/Edge-Data-Store-Docs/V1/SDS/Read%20data/Reading_Data_API_1-0.html#get-last-value|EDS Documentation}
   * @param unit The namespace/community of the specified stream
   * @param stream The stream to query last value against
   */
  getLastValue(unit: OrganizationUnit, stream: SdsStream): Observable<any> {
    if (unit.Type === OrganizationUnitType.Namespace) {
      return this.http
        .get(
          `${(unit.Unit as SdsNamespace).Self}/Streams/${stream.Id}/Data/Last`
        )
        .pipe(catchError(this.handleError('Error getting last value')));
    } else {
      return this.http
        .get(`${stream.Self}/Data/Last`, {
          headers: new HttpHeaders().set('Community-Id', unit.Unit.Id),
        })
        .pipe(catchError(this.handleError('Error getting last value')));
    }
  }

  /**
   * Makes a request for a range of values from a stream in a specified namespace, see
   * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/SequentialDataStore/Reading_Data_API.html#range|Cds Documentation} and
   * {@link https://osisoft.github.io/Edge-Data-Store-Docs/V1/SDS/Read%20data/Reading_Data_API_1-0.html#range|EDS Documentation}
   * @param namespace The namespace ID of the specified stream
   * @param stream The stream to query range values against
   * @param startIndex The starting index of the query range
   * @param count The number of values to request
   * @param reversed Optional direction of the request. By default, range request move forward from the startIndex, but a reversed request
   * moves backward from the startIndex.
   */
  getRangeValues(
    unit: OrganizationUnit,
    stream: SdsStream,
    startIndex: string,
    count: number,
    reversed = false
  ): Observable<any[]> {
    if (unit.Type === OrganizationUnitType.Namespace) {
      return this.http
        .get(
          `${(unit.Unit as SdsNamespace).Self}/Streams/${
            stream.Id
          }/Data?startIndex=${startIndex}&count=${count}${
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
    } else {
      return this.http
        .get(
          `${stream.Self}/Data?startIndex=${startIndex}&count=${count}${
            reversed ? '&reversed=true' : ''
          }`,
          {
            headers: {
              Accept: 'application/json',
              'Accept-Verbosity': 'verbose',
              'Community-Id': unit.Unit.Id,
            },
          }
        )
        .pipe(
          map((r) => r as any[]),
          catchError(this.handleError('Error getting range values'))
        );
    }
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
