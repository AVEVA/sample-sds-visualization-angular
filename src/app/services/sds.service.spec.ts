import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { mockSettings } from 'src/tests';
import {
  AppSettings,
  DEFAULT,
  DIAGNOSTICS,
  SdsStream,
  SdsType,
  SdsTypeCode,
  SETTINGS,
} from '~/models';
import { SdsService } from './sds.service';

describe('SdsService', () => {
  let service: SdsService;
  let http: HttpTestingController;
  const settings: AppSettings = { ...mockSettings };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: SETTINGS, useValue: settings }],
    });

    service = TestBed.inject(SdsService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNamespaces', () => {
    afterEach(() => {
      settings.TenantId = mockSettings.TenantId;
    });

    it('should get hard coded list for EDS', () => {
      settings.TenantId = DEFAULT;
      let result: string[];
      service.getNamespaces().subscribe((r) => (result = r));
      expect(result).toEqual([DEFAULT, DIAGNOSTICS]);
    });

    it('should get namespaces from SDS', () => {
      let result: string[];
      service.getNamespaces().subscribe((r) => (result = r));
      http.expectOne(service.baseUrl).flush([{ Id: 'Id' }]);
      expect(result).toEqual(['Id']);
    });
  });

  describe('getTypes', () => {
    it('should get types from SDS', () => {
      const type: SdsType = {
        Id: 'Id',
        Name: 'Name',
        Description: 'Description',
        SdsTypeCode: SdsTypeCode.Object,
        Properties: null,
      };
      let result: SdsType[];
      service.getTypes('Namespace').subscribe((r) => (result = r));
      http.expectOne(`${service.baseUrl}/Namespace/Types`).flush([type]);
      expect(result).toEqual([type]);
    });
  });

  describe('getStreams', () => {
    it('should get streams from SDS', () => {
      const stream: SdsStream = {
        Id: 'Id',
        Name: 'Name',
        Description: 'Description',
        TypeId: 'TypeId',
      };
      let result: SdsStream[];
      service.getStreams('Namespace', 'Query').subscribe((r) => (result = r));
      http
        .expectOne(`${service.baseUrl}/Namespace/Streams?query=Query*`)
        .flush([stream]);
      expect(result).toEqual([stream]);
    });

    it('should handle null query', () => {
      const stream: SdsStream = {
        Id: 'Id',
        Name: 'Name',
        Description: 'Description',
        TypeId: 'TypeId',
      };
      let result: SdsStream[];
      service.getStreams('Namespace', null).subscribe((r) => (result = r));
      http
        .expectOne(`${service.baseUrl}/Namespace/Streams?query=*`)
        .flush([stream]);
      expect(result).toEqual([stream]);
    });
  });

  describe('getLastValue', () => {
    it('should get the latest value from SDS', () => {
      const last = 'last';
      let result: any;
      service
        .getLastValue('Namespace', 'Stream')
        .subscribe((r) => (result = r));
      http
        .expectOne(`${service.baseUrl}/Namespace/Streams/Stream/Data/Last`)
        .flush(last);
      expect(result).toEqual(last);
    });
  });

  describe('getRangeValues', () => {
    it('should get a range of values from SDS', () => {
      const data = ['a', 'b', 'c'];
      let result: any[];
      service
        .getRangeValues('Namespace', 'Stream', 'StartIndex', 3)
        .subscribe((r) => (result = r));
      http
        .expectOne(
          `${service.baseUrl}/Namespace/Streams/Stream/Data?startIndex=StartIndex&count=3`
        )
        .flush(data);
      expect(result).toEqual(data);
    });

    it('should handle the reversed flag', () => {
      const data = ['a', 'b', 'c'];
      let result: any[];
      service
        .getRangeValues('Namespace', 'Stream', 'StartIndex', 3, true)
        .subscribe((r) => (result = r));
      http
        .expectOne(
          `${service.baseUrl}/Namespace/Streams/Stream/Data?startIndex=StartIndex&count=3&reversed=true`
        )
        .flush(data);
      expect(result).toEqual(data);
    });
  });

  describe('handleError', () => {
    it('should handle ErrorEvent', () => {
      spyOn(console, 'error');
      const error = new ErrorEvent('Error', { message: 'ErrorMessage' });
      const result = service.handleError('UserMessage')({
        error,
      } as any);
      expect(console.error).toHaveBeenCalledWith(
        'An error occurred:',
        'ErrorMessage'
      );
      expect(result._subscribe).toBeTruthy();
    });

    it('should handle Http Error', () => {
      spyOn(console, 'error');
      const result = service.handleError('UserMessage')(
        new HttpErrorResponse({ error: 'HttpError', status: 400 })
      );
      expect(console.error).toHaveBeenCalledWith(
        'SDS backend returned code 400, body was: HttpError'
      );
      expect(result._subscribe).toBeTruthy();
    });
  });
});
