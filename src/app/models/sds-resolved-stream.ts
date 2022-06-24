import { SdsType } from './sds-type';

/**
 * SDS Resolved Stream representation
 */
export interface SdsResolvedStream {
  Id: string;
  Name: string;
  Description: string;
  Resolved: boolean;
  Type: SdsType;
}
