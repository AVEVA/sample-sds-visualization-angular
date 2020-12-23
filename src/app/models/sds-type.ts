import { SdsProperty } from './sds-property';
import { SdsTypeCode } from './sds-type-code';

export interface SdsType {
  Id: string;
  Name: string;
  Description: string;
  SdsTypeCode: SdsTypeCode;
  Properties: SdsProperty[] | null;
}
