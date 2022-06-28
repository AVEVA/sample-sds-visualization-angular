import { SdsCommunity } from './sds-community';
import { SdsNamespace } from './sds-namespace';

/**
 * Representation of the two logical units of organization for data within Data Hub: namespaces and communities
 */
export enum OrganizationUnitType {
  Namespace = 'Namespace',
  Community = 'Community',
}

export interface OrganizationUnit {
  Unit: SdsCommunity | SdsNamespace;
  Type: OrganizationUnitType;
}
