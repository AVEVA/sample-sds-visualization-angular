import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { mockSettings } from 'src/tests';
import { AppSettings, DEFAULT, SETTINGS } from '~/models';
import { OidcService } from '~/services';
import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let oidc: OidcService;
  let router: Router;
  const settings: AppSettings = { ...mockSettings };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [OidcService, { provide: SETTINGS, useValue: settings }],
    });
    guard = TestBed.inject(AuthorizationGuard);
    oidc = TestBed.inject(OidcService);
    router = TestBed.inject(Router);
  });

  describe('frameElement', () => {
    it('should return the window frameElement', () => {
      expect(guard.frameElement).toBe(window.frameElement);
    });
  });

  describe('canActivate', () => {
    afterEach(() => {
      settings.TenantId = mockSettings.TenantId;
    });

    it('should return true if TenantID is default', (done) => {
      settings.TenantId = DEFAULT;
      guard.canActivate().subscribe((a) => {
        expect(a).toBeTrue();
        done();
      });
    });

    it('should return true if user is already authenticated', (done) => {
      spyOn(oidc, 'checkAuth').and.returnValue(of(true));
      guard.canActivate().subscribe((a) => {
        expect(oidc.checkAuth).toHaveBeenCalled();
        expect(a).toBeTrue();
        done();
      });
    });

    it('should try silent callback in frame element', (done) => {
      spyOn(oidc, 'checkAuth').and.returnValue(of(false));
      const spyFrameElement = spyOnProperty(
        guard,
        'frameElement'
      ).and.returnValue(true);
      spyOn(oidc, 'signinSilentCallback').and.returnValue(of(null));
      spyOn(router, 'navigate');
      guard.canActivate().subscribe((a) => {
        expect(oidc.checkAuth).toHaveBeenCalled();
        expect(spyFrameElement).toHaveBeenCalled();
        expect(oidc.signinSilentCallback).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith([]);
        expect(a).toBeTrue();
        done();
      });
    });

    it('should catch error from redirect callback callback', (done) => {
      spyOn(oidc, 'checkAuth').and.returnValue(of(false));
      const spyFrameElement = spyOnProperty(
        guard,
        'frameElement'
      ).and.returnValue(false);
      spyOn(oidc, 'signinRedirectCallback').and.returnValue(throwError('test'));
      spyOn(oidc, 'login');
      guard.canActivate().subscribe((a) => {
        expect(oidc.checkAuth).toHaveBeenCalled();
        expect(spyFrameElement).toHaveBeenCalled();
        expect(oidc.signinRedirectCallback).toHaveBeenCalled();
        expect(oidc.login).toHaveBeenCalled();
        expect(a).toBeFalse();
        done();
      });
    });
  });
});
