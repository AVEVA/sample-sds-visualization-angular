import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';

import { MockOidcSecurityService, mockSettings } from 'src/tests';
import { AppComponent } from './app.component';
import { AppSettings, DEFAULT, SETTINGS } from './models';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let oidc: OidcSecurityService;
  let router: Router;
  const settings: AppSettings = { ...mockSettings };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatToolbarModule],
      providers: [
        { provide: OidcSecurityService, useClass: MockOidcSecurityService },
        { provide: SETTINGS, useValue: settings },
      ],
      declarations: [AppComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        oidc = TestBed.inject(OidcSecurityService);
      });
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should skip auth check against eds', () => {
    spyOn(oidc, 'checkAuth');
    component.settings = { ...mockSettings, ...{ TenantId: DEFAULT } };
    fixture.detectChanges();
    expect(oidc.checkAuth).not.toHaveBeenCalled();
  });

  it('should handle already authenticated user', () => {
    spyOn(oidc, 'checkAuth').and.returnValue(of(true));
    spyOn(router, 'navigate');
    fixture.detectChanges();
    expect(oidc.checkAuth).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect unauthenticated user to autologin', () => {
    spyOn(oidc, 'checkAuth').and.returnValue(of(false));
    spyOn(router, 'navigate');
    fixture.detectChanges();
    expect(oidc.checkAuth).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/autologin']);
  });
});
