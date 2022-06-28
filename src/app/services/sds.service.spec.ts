import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { mockSettings } from 'src/tests';
import {
  AppSettings,
  DEFAULT,
  DIAGNOSTICS,
  OrganizationUnit,
  OrganizationUnitType,
  SdsCommunity,
  SdsNamespace,
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
  const organizationUnit: OrganizationUnit = {
    Unit: {
      Id: 'Id',
      Name: 'Name',
      Description: 'Description',
      InstanceId: 'InstanceId',
      Region: 'Region',
      Self: 'Self',
    },
    Type: OrganizationUnitType.Namespace,
  };
  const type: SdsType = {
    Id: 'TypeId',
    Name: 'Name',
    Description: 'Description',
    SdsTypeCode: SdsTypeCode.Object,
    Properties: null,
  };
  const stream: SdsStream = {
    Id: 'Id',
    Name: 'Name',
    Description: 'Description',
    TypeId: 'TypeId',
    Self: 'Self',
    TenantId: 'TenantId',
    TenantName: 'TenantName',
    NamespaceId: 'NamespaceId',
    CommunityId: 'CommunityId',
  };

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

  describe('edsNamespace', () => {
    it('should create an organization unit object for EDS', () => {
      const id = 'diagnostics';
      const result = service.edsNamespace(id);
      expect(result.Unit.Id).toEqual(id);
    });
  });

  describe('getNamespaces', () => {
    afterEach(() => {
      settings.TenantId = mockSettings.TenantId;
    });

    it('should get hard coded list for EDS', () => {
      settings.TenantId = DEFAULT;
      let result: OrganizationUnit[];
      service.getNamespaces().subscribe((r) => (result = r));
      expect(result).toEqual([
        service.edsNamespace(DEFAULT),
        service.edsNamespace(DIAGNOSTICS),
      ]);
    });

    it('should get namespaces from SDS', () => {
      let result: OrganizationUnit[];
      service.getNamespaces().subscribe((r) => (result = r));
      const ns = service.edsNamespace('diagnostics');
      http
        .expectOne('Resource/api/v1/Tenants/TenantId/Namespaces')
        .flush([ns.Unit]);
      expect(result).toEqual([ns]);
    });
  });

  describe('getCommunities', () => {
    afterEach(() => {
      settings.TenantId = mockSettings.TenantId;
    });

    it('should get nothing for EDS', () => {
      settings.TenantId = DEFAULT;
      let result: OrganizationUnit[];
      service.getCommunities().subscribe((r) => (result = r));
      expect(result).toEqual([]);
    });

    it('should get namespaces from SDS', () => {
      let result: OrganizationUnit[];
      service.getCommunities().subscribe((r) => (result = r));
      const ns: OrganizationUnit = {
        Unit: {
          Id: 'CommunityId',
          Name: 'CommunityName',
          Description: '',
          InstanceId: '',
          Region: '',
          Self: '',
        },
        Type: OrganizationUnitType.Community,
      };
      http
        .expectOne('Resource/api/v1-preview/Tenants/TenantId/Communities')
        .flush([ns.Unit]);
      expect(result).toEqual([ns]);
    });
  });

  describe('getType', () => {
    it('should get types from SDS', () => {
      let result: SdsType;
      service.getType(organizationUnit, stream).subscribe((r) => (result = r));
      http
        .expectOne(
          'Resource/api/v1-preview/Tenants/TenantId/Namespaces/Id/Streams/Id/Resolved'
        )
        .flush({ Type: type });
      expect(result).toEqual(type);
    });
  });

  describe('getStreams', () => {
    it('should get streams from SDS', () => {
      let result: SdsStream[];
      service
        .getStreams(organizationUnit, 'Query')
        .subscribe((r) => (result = r));
      http
        .expectOne(
          'Resource/api/v1/Tenants/TenantId/Namespaces/Id/Streams?query=Query*'
        )
        .flush([stream]);
      expect(result).toEqual([stream]);
    });

    it('should handle null query', () => {
      let result: SdsStream[];
      service.getStreams(organizationUnit, null).subscribe((r) => (result = r));
      http
        .expectOne(
          'Resource/api/v1/Tenants/TenantId/Namespaces/Id/Streams?query=*'
        )
        .flush([stream]);
      expect(result).toEqual([stream]);
    });
  });

  describe('getLastValue', () => {
    it('should get the latest value from SDS', () => {
      const last = 'last';
      let result: any;
      service
        .getLastValue(organizationUnit, stream)
        .subscribe((r) => (result = r));
      http
        .expectOne(
          'Resource/api/v1/Tenants/TenantId/Namespaces/Id/Streams/Id/Data/Last'
        )
        .flush(last);
      expect(result).toEqual(last);
    });
  });

  describe('getRangeValues', () => {
    it('should get a range of values from SDS', () => {
      const data = ['a', 'b', 'c'];
      let result: any[];
      service
        .getRangeValues(organizationUnit, stream, 'StartIndex', 3)
        .subscribe((r) => (result = r));
      http
        .expectOne(
          'Resource/api/v1/Tenants/TenantId/Namespaces/Id/Streams/Id/Data?startIndex=StartIndex&count=3'
        )
        .flush(data);
      expect(result).toEqual(data);
    });

    it('should handle the reversed flag', () => {
      const data = ['a', 'b', 'c'];
      let result: any[];
      service
        .getRangeValues(organizationUnit, stream, 'StartIndex', 3, true)
        .subscribe((r) => (result = r));
      http
        .expectOne(
          'Resource/api/v1/Tenants/TenantId/Namespaces/Id/Streams/Id/Data?startIndex=StartIndex&count=3&reversed=true'
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
      expect(result.subscribe).toBeTruthy();
    });

    it('should handle Http Error', () => {
      spyOn(console, 'error');
      const result = service.handleError('UserMessage')(
        new HttpErrorResponse({ error: 'HttpError', status: 400 })
      );
      expect(console.error).toHaveBeenCalledWith(
        'SDS backend returned code 400, body was: HttpError'
      );
      expect(result.subscribe).toBeTruthy();
    });
  });
});
