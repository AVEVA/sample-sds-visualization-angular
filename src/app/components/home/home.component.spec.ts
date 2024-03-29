import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';

import { mockSettings } from 'src/tests';
import {
  AppSettings,
  OrganizationUnit,
  OrganizationUnitType,
  SdsStream,
  SdsType,
  SdsTypeCode,
  SETTINGS,
  StreamConfig,
} from '~/models';
import { SdsService } from '~/services';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let sds: SdsService;
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
  const supportedType: SdsType = {
    Id: 'TypeId',
    Name: '',
    Description: '',
    SdsTypeCode: SdsTypeCode.Object,
    Properties: [
      {
        Id: 'Timestamp',
        Name: '',
        Description: '',
        Order: 0,
        IsKey: true,
        SdsType: {
          Id: '',
          Name: '',
          Description: '',
          SdsTypeCode: SdsTypeCode.DateTime,
          Properties: null,
        },
      },
      {
        Id: 'Value',
        Name: '',
        Description: '',
        Order: null,
        IsKey: false,
        SdsType: {
          Id: '',
          Name: '',
          Description: '',
          SdsTypeCode: SdsTypeCode.Double,
          Properties: null,
        },
      },
    ],
  };
  const emptyType: SdsType = {
    Id: 'TypeId',
    Name: '',
    Description: '',
    SdsTypeCode: SdsTypeCode.Object,
    Properties: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
      ],
      providers: [SdsService, { provide: SETTINGS, useValue: settings }],
      declarations: [HomeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    component.debounce = 0;
    sds = TestBed.inject(SdsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('streamFormDisabled', () => {
    it('should disable when stream is not found', () => {
      component.types = [supportedType];
      expect(component.streamFormDisabled).toBeTrue();
    });

    it('should disable when type is not found', () => {
      component.streams = [stream];
      component.types = [];
      component.streamCtrl.setValue(stream.Id);
      expect(component.streamFormDisabled).toBeTrue();
    });

    it('should disable when key is not found', () => {
      component.streams = [stream];
      component.types = [emptyType];
      component.streamCtrl.setValue(stream.Id);
      expect(component.streamFormDisabled).toBeTrue();
    });

    it('should disable if key does not match', () => {
      component.isTime = false;
      component.streams = [stream];
      component.types = [supportedType];
      component.streamCtrl.setValue(stream.Id);
      expect(component.streamFormDisabled).toBeTrue();
    });

    it('should enable for safe stream to add', () => {
      component.streams = [stream];
      component.types = [supportedType];
      component.isTime = true;
      component.streamCtrl.setValue(stream.Id);
      expect(component.streamFormDisabled).toBeFalse();
    });
  });

  describe('ngOnInit', () => {
    it('should get list of namespaces', () => {
      spyOn(sds, 'getNamespaces').and.returnValue(of([organizationUnit]));
      component.ngOnInit();
      expect(component.organizationUnits).toEqual([organizationUnit]);
    });

    it('should set up component subscriptions', fakeAsync(() => {
      spyOn(component, 'organizationUnitChanges');
      spyOn(component, 'queryStreams');
      spyOn(component, 'updateData');
      spyOn(component, 'refreshChanges');
      spyOn(component, 'setupRefresh');
      component.ngOnInit();
      component.organizationUnitCtrl.setValue('');
      component.streamCtrl.setValue('');
      component.eventsCtrl.setValue('100');
      component.refreshCtrl.setValue('5000');
      tick(); // Wait for debounce
      expect(component.organizationUnitChanges).toHaveBeenCalled();
      expect(component.queryStreams).toHaveBeenCalled();
      expect(component.updateData).toHaveBeenCalled();
      expect(component.refreshChanges).toHaveBeenCalled();
      expect(component.setupRefresh).toHaveBeenCalled();
    }));
  });

  describe('ngOnDestroy', () => {
    it('should handle null subscription', () => {
      let err: any;
      component.subscription = null;
      try {
        component.ngOnDestroy();
      } catch (e) {
        err = e;
      }
      expect(err).toBeUndefined();
    });

    it('should unsubscribe from refresh subscription', () => {
      const sub: any = { unsubscribe: () => {} };
      spyOn(sub, 'unsubscribe');
      component.subscription = sub;
      component.ngOnDestroy();
      expect(sub.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('setupRefresh', () => {
    it('should set up a new refresh interval', () => {
      const sub = component.subscription;
      spyOn(sub, 'unsubscribe');
      spyOn(component, 'updateData');
      const refresh$ = new Subject<number>();
      component.setupRefresh(refresh$);
      expect(sub.unsubscribe).toHaveBeenCalled();
      expect(component.refresh$).toEqual(refresh$);
      expect(component.subscription).not.toEqual(sub);
      refresh$.next(1);
      expect(component.updateData).toHaveBeenCalled();
    });
  });

  describe('organizationUnitChanges', () => {
    it('should query types and streams', () => {
      spyOn(sds, 'getStreams').and.returnValue(of([stream]));
      spyOn(sds, 'getType').and.returnValue(of(supportedType));
      component.organizationUnits = [organizationUnit];
      component.organizationUnitChanges(organizationUnit.Unit.Name);
      expect(sds.getStreams).toHaveBeenCalledWith(organizationUnit, null);
      expect(sds.getType).toHaveBeenCalledWith(organizationUnit, stream);
      expect(component.types).toEqual([supportedType]);
    });

    it('should do nothing if namespace is not recognized', () => {
      spyOn(sds, 'getType').and.returnValue(of(supportedType));
      component.organizationUnitChanges(organizationUnit.Unit.Name);
      expect(sds.getType).not.toHaveBeenCalled();
    });
  });

  describe('refreshChanges', () => {
    it('should do nothing for invalid numbers', () => {
      spyOn(component.subscription, 'unsubscribe');
      component.refreshChanges('test');
      expect(component.subscription.unsubscribe).not.toHaveBeenCalled();
    });

    it('should set up new refresh and subscription', () => {
      spyOn(component.subscription, 'unsubscribe');
      spyOn(component, 'setupRefresh');
      component.refreshChanges('1');
      expect(component.setupRefresh).toHaveBeenCalled();
    });
  });

  describe('isTypeSupported', () => {
    it('should check for unsupported SdsTypeCode', () => {
      expect(
        component.isTypeSupported({
          Id: '',
          Name: '',
          Description: '',
          SdsTypeCode: SdsTypeCode.Double,
          Properties: null,
        })
      ).toBeFalse();
    });

    it('should check for unsupported key', () => {
      spyOn(component, 'isPropertyKey').and.returnValue(false);
      expect(
        component.isTypeSupported({
          Id: '',
          Name: '',
          Description: '',
          SdsTypeCode: SdsTypeCode.Object,
          Properties: [null],
        })
      ).toBeFalse();
    });

    it('should return true for supported type', () => {
      spyOn(component, 'isPropertyKey').and.returnValue(true);
      expect(
        component.isTypeSupported({
          Id: '',
          Name: '',
          Description: '',
          SdsTypeCode: SdsTypeCode.Object,
          Properties: [null],
        })
      ).toBeTrue();
    });
  });

  describe('isPropertyKey', () => {
    it('should check IsKey', () => {
      expect(
        component.isPropertyKey({
          Id: '',
          Name: '',
          Description: '',
          Order: 0,
          IsKey: false,
          SdsType: null,
        })
      ).toBeFalse();
    });

    it('should check Order', () => {
      expect(
        component.isPropertyKey({
          Id: '',
          Name: '',
          Description: '',
          Order: 1,
          IsKey: true,
          SdsType: null,
        })
      ).toBeFalse();
    });

    it('should handle null Order', () => {
      expect(
        component.isPropertyKey({
          Id: '',
          Name: '',
          Description: '',
          Order: null,
          IsKey: true,
          SdsType: {
            Id: '',
            Name: '',
            Description: '',
            SdsTypeCode: SdsTypeCode.Double,
            Properties: null,
          },
        })
      ).toBeTrue();
    });

    it('should handle unsupported SdsTypeCode', () => {
      expect(
        component.isPropertyKey({
          Id: '',
          Name: '',
          Description: '',
          Order: null,
          IsKey: true,
          SdsType: {
            Id: '',
            Name: '',
            Description: '',
            SdsTypeCode: SdsTypeCode.Object,
            Properties: null,
          },
        })
      ).toBeFalse();
    });

    it('should return true for supported property', () => {
      expect(
        component.isPropertyKey({
          Id: '',
          Name: '',
          Description: '',
          Order: 0,
          IsKey: true,
          SdsType: {
            Id: '',
            Name: '',
            Description: '',
            SdsTypeCode: SdsTypeCode.Double,
            Properties: null,
          },
        })
      ).toBeTrue();
    });
  });

  describe('queryStreams', () => {
    it('should do nothing if namespace does not match', () => {
      spyOn(sds, 'getStreams');
      component.queryStreams('', '');
      expect(sds.getStreams).not.toHaveBeenCalled();
    });

    it('should make call to SDS and filter out streams with unsupported type', () => {
      spyOn(sds, 'getStreams').and.returnValue(of([]));
      component.organizationUnits = [organizationUnit];
      component.queryStreams(organizationUnit.Unit.Name, 'q');
      expect(sds.getStreams).toHaveBeenCalledWith(organizationUnit, 'q');
      expect(component.streams).toEqual([]);
    });

    it('should make call to SDS and set supported streams', () => {
      spyOn(sds, 'getStreams').and.returnValue(of([stream]));
      component.organizationUnits = [organizationUnit];
      component.types = [supportedType];
      component.queryStreams(organizationUnit.Unit.Name, 'q');
      expect(sds.getStreams).toHaveBeenCalledWith(organizationUnit, 'q');
      expect(component.streams).toEqual([stream]);
    });
  });

  describe('addStream', () => {
    it('should add a stream to the chart', () => {
      spyOn(component, 'updateData');
      spyOn(component.streamCtrl, 'setValue').and.callThrough();
      const chart = { update: () => {}, data: { datasets: [] } } as any;
      spyOn(chart, 'update');
      spyOn(component, 'getChart').and.returnValue(chart);
      const table = { renderRows: () => {} } as any;
      spyOn(table, 'renderRows');
      component.table = table;
      component.organizationUnits = [organizationUnit];
      component.streams = [stream];
      component.types = [supportedType];
      component.streamCtrl.setValue(stream.Id);
      component.addStream();
      expect(component.configs.length).toEqual(1);
      expect(component.getChart).toHaveBeenCalledWith();
      expect(component.chart.data.datasets.length).toEqual(1);
      expect(chart.update).toHaveBeenCalled();
      expect(component.updateData).toHaveBeenCalled();
      expect(component.streamCtrl.setValue).toHaveBeenCalledWith('');
      expect(table.renderRows).toHaveBeenCalled();
    });

    it('should skip creating a chart if one already exists', () => {
      spyOn(component, 'updateData').and.callFake(function(){});
      component.chart = { update: () => {}, data: { datasets: [] } } as any;
      spyOn(component, 'getChart');
      component.organizationUnits = [organizationUnit];
      component.streams = [stream];
      component.types = [supportedType];
      component.streamCtrl.setValue(stream.Id);
      component.addStream();
      expect(component.getChart).not.toHaveBeenCalled();
    });
  });

  describe('getChart', () => {
    it('should create a time series chart', () => {
      component.isTime = true;
      expect(component.getChart().options.scales.x.type).toEqual('time');
    });

    it('should create a linear chart', () => {
      expect(component.getChart().options.scales.x.type).toEqual('linear');
    });
  });

  describe('updateData', () => {
    const config: StreamConfig = {
      unit: organizationUnit,
      stream: stream,
      key: 'key',
      valueFields: ['value'],
    };

    const last: any = { ['key']: 'last' };
    const data: any[] = [{ ['key']: 'last', ['value']: 'value' }];

    beforeEach(() => {
      spyOn(sds, 'getLastValue').and.returnValue(of(last));
      spyOn(component, 'updateChart');
      component.configs = [{ ...config }];
    });

    it('should get data for streams', () => {
      spyOn(sds, 'getRangeValues').and.returnValue(of(data));
      component.updateData();
      expect(sds.getLastValue).toHaveBeenCalledWith(config.unit, config.stream);
      expect(sds.getRangeValues).toHaveBeenCalledWith(
        config.unit,
        config.stream,
        'last',
        100,
        true
      );
      expect(component.updateChart).toHaveBeenCalled();
      expect(component.configs[0].lastUpdate).toBeTruthy();
      expect(component.configs[0].lastCount).toEqual(1);
    });

    it('should handle date indices', () => {
      spyOn(sds, 'getRangeValues').and.returnValue(of(data));
      component.isTime = true;
      component.updateData();
      expect(sds.getLastValue).toHaveBeenCalledWith(config.unit, config.stream);
      expect(sds.getRangeValues).toHaveBeenCalledWith(
        config.unit,
        config.stream,
        'last',
        100,
        true
      );
      expect(component.updateChart).toHaveBeenCalled();
      expect(component.configs[0].lastUpdate).toBeTruthy();
      expect(component.configs[0].lastCount).toEqual(1);
    });

    it('should handle empty data response', () => {
      spyOn(sds, 'getRangeValues').and.returnValue(of(null));
      component.isTime = true;
      component.updateData();
      expect(sds.getLastValue).toHaveBeenCalledWith(config.unit, config.stream);
      expect(sds.getRangeValues).toHaveBeenCalledWith(
        config.unit,
        config.stream,
        'last',
        100,
        true
      );
      expect(component.updateChart).not.toHaveBeenCalled();
      expect(component.configs[0].lastUpdate).toBeTruthy();
      expect(component.configs[0].lastCount).toEqual(0);
    });
  });

  describe('updateChart', () => {
    it('should update chart datasets', () => {
      component.chart = {
        update: () => {},
        data: {
          datasets: [
            { label: 'label', data: [] },
            { label: 'nomatch', data: [] },
          ],
        },
      } as any;
      spyOn(component.chart, 'update');
      component.updateChart({ ['label']: [null] } as any);
      expect(component.chart.data.datasets[0].data).toEqual([null]);
      expect(component.chart.update).toHaveBeenCalled();
    });
  });

  describe('getColor', () => {
    it('should get a random hex color', () => {
      const result = component.getColor();
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(7);
    });
  });
});
