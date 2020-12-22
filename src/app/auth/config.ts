import { LogLevel, OidcConfigService } from 'angular-auth-oidc-client';
import { AppSettings, DEFAULT } from '../models';

export function configureAuth(
  oidcConfigService: OidcConfigService,
  settings: AppSettings
): () => any {
  return () =>
    settings.TenantId === DEFAULT
      ? null
      : oidcConfigService.withConfig({
          stsServer: `${settings.Resource}/identity`,
          redirectUrl: window.location.origin,
          postLogoutRedirectUri: window.location.origin,
          clientId: settings.ClientId,
          scope: 'openid ocsapi',
          responseType: 'code',
          silentRenew: true,
          silentRenewUrl: `${window.location.origin}/silent-renew.html`,
          logLevel: LogLevel.Warn,
        });
}
