import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { mockSettings } from 'src/tests';
import { AppSettings, SETTINGS } from '~/models';
import { SdsService } from '~/services';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let sds: SdsService;
  const settings: AppSettings = { ...mockSettings };

  beforeEach(async () => {
    TestBed.configureTestingModule({
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
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        sds = TestBed.inject(SdsService);
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should get list of namespaces', () => {
      const value = ['test'];
      spyOn(sds, 'getNamespaces').and.returnValue(of(value));
      fixture.detectChanges();
      expect(component.namespaces).toEqual(value);
    });
  });

  describe('namespaceChanges', () => {
    it('should query types and streams', () => {
      spyOn(component, 'queryTypes');
      spyOn(component, 'queryStreams');
      const value = 'namespace';
      component.namespaceChanges(value);
      expect(component.queryTypes).toHaveBeenCalledWith(value);
      expect(component.queryStreams).toHaveBeenCalledWith(value, null);
    });
  });

  describe('streamChanges', () => {
    it('should query streams and set up datasets', () => {
      spyOn(component, 'queryStreams');
      spyOn(component, 'setupDatasets');
      const value = 'stream';
      component.streamChanges(value);
      expect(component.queryStreams).toHaveBeenCalledWith(null, value);
      expect(component.setupDatasets).toHaveBeenCalledWith(value);
    });
  });
});
