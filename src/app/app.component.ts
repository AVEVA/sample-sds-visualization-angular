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

  ngOnInit(): void {
    if (this.settings.TenantId !== DEFAULT) {
      this.oidcSecurityService.checkAuth().subscribe((isAuthenticated) => {
        if (!isAuthenticated && window.location.pathname !== '/autologin') {
          this.router.navigate(['/autologin']);
        }
      });
    }
  }
}
