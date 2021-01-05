import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthModule, OidcSecurityService } from 'angular-auth-oidc-client';

import { MockOidcSecurityService } from 'src/tests';
import { AutoLoginComponent } from './auto-login.component';

describe('AutoLoginComponent', () => {
  let component: AutoLoginComponent;
  let fixture: ComponentFixture<AutoLoginComponent>;
  let oidc: OidcSecurityService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AuthModule.forRoot()],
      providers: [
        { provide: OidcSecurityService, useClass: MockOidcSecurityService },
      ],
      declarations: [AutoLoginComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AutoLoginComponent);
        component = fixture.componentInstance;
        oidc = TestBed.inject(OidcSecurityService);
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call out to authorize', () => {
    spyOn(oidc, 'authorize');
    fixture.detectChanges();
    expect(oidc.authorize).toHaveBeenCalled();
  });
});
