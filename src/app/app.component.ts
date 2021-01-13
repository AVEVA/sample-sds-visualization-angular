import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { AppSettings, DEFAULT, SETTINGS } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  DEFAULT = DEFAULT;

  constructor(
    public router: Router,
    public oidcSecurityService: OidcSecurityService,
    @Inject(SETTINGS) public settings: AppSettings
  ) {}

  /** Set up the component when Angular is ready */
  ngOnInit(): void {
    /** If TenantId is 'default' then this is EDS, do not check for authentication */
    if (this.settings.TenantId !== DEFAULT) {
      /** Check authentication status of the OidcSecurity Service */
      this.oidcSecurityService.checkAuth().subscribe((isAuthenticated) => {
        /** If the user is not authenticated against OCS and has not already been redirected to autologin, navigate to autologin */
        if (!isAuthenticated && window.location.pathname !== '/autologin') {
          this.router.navigate(['/autologin']);
        }
      });
    }
  }
}
