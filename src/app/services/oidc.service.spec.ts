import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

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

  describe('login', () => {
    it('should call signinRedirect', () => {
      spyOn(service.mgr, 'signinRedirect');
      service.login();
      expect(service.mgr.signinRedirect).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call signoutRedirect', () => {
      spyOn(service.mgr, 'signoutRedirect');
      service.logout();
      expect(service.mgr.signoutRedirect).toHaveBeenCalled();
    });
  });

  describe('signinRedirectCallback', () => {
    it('should return an observable and set auth headers', (done) => {
      const value: any = 'user';
      const p = Promise.resolve(value);
      spyOn(service.mgr, 'signinRedirectCallback').and.returnValue(p);
      spyOn(service, 'setAuthHeaders');
      service.signinRedirectCallback().subscribe((user) => {
        expect(service.setAuthHeaders).toHaveBeenCalledWith(value);
        expect(user).toBe(value);
        done();
      });
    });
  });

  describe('signinSilentCallback', () => {
    it('should return an observable and set auth headers', (done) => {
      const value: any = 'user';
      const p = Promise.resolve(value);
      spyOn(service.mgr, 'signinSilentCallback').and.returnValue(p);
      spyOn(service, 'setAuthHeaders');
      service.signinSilentCallback().subscribe((user) => {
        expect(service.setAuthHeaders).toHaveBeenCalledWith(value);
        expect(user).toBe(value);
        done();
      });
    });
  });

  describe('getUser', () => {
    it('should return an observable and set auth headers', (done) => {
      const value: any = 'user';
      const p = Promise.resolve(value);
      spyOn(service.mgr, 'getUser').and.returnValue(p);
      spyOn(service, 'setAuthHeaders');
      service.getUser().subscribe((user) => {
        expect(service.setAuthHeaders).toHaveBeenCalledWith(value);
        expect(user).toBe(value);
        done();
      });
    });
  });

  describe('checkAuth', () => {
    it('should check whether user is expired', (done) => {
      const value: any = { expired: true };
      spyOn(service, 'getUser').and.returnValue(of(value));
      service.checkAuth().subscribe((isAuthenticated) => {
        expect(service.getUser).toHaveBeenCalled();
        expect(isAuthenticated).toBeFalse();
        done();
      });
    });

    it('should catch an error', (done) => {
      spyOn(service, 'getUser').and.returnValue(throwError('test'));
      service.checkAuth().subscribe((isAuthenticated) => {
        expect(service.getUser).toHaveBeenCalled();
        expect(isAuthenticated).toBeFalse();
        done();
      });
    });

    it('should return true for valid user', (done) => {
      const value: any = { expired: false };
      spyOn(service, 'getUser').and.returnValue(of(value));
      service.checkAuth().subscribe((isAuthenticated) => {
        expect(service.getUser).toHaveBeenCalled();
        expect(isAuthenticated).toBeTrue();
        done();
      });
    });
  });

  describe('setAuthHeaders', () => {
    it('should set the auth headers for http requests', () => {
      service.setAuthHeaders({
        token_type: 'type',
        access_token: 'token',
      } as any);
      expect(service.authHeaders).toEqual({ Authorization: 'type token' });
    });

    it('should set to null if user is null', () => {
      service.setAuthHeaders(null);
      expect(service.authHeaders).toBeNull();
    });
  });
});
