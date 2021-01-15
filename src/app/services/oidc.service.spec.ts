import { TestBed } from '@angular/core/testing';

import { mockSettings } from 'src/tests';
import { AppSettings, SETTINGS } from '~/models';
import { OidcService } from './oidc.service';

describe('OidcService', () => {
  let service: OidcService;
  const settings: AppSettings = { ...mockSettings };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SETTINGS, useValue: settings }],
    });

    service = TestBed.inject(OidcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
