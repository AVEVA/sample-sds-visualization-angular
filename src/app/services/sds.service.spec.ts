import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { mockSettings } from 'src/tests';
import { AppSettings, SETTINGS } from '~/models';
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
});
