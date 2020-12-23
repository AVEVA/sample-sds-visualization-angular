import { SdsType } from './sds-type';

export interface SdsProperty {
  Id: string;
  Name: string;
  Description: string;
  Order: number;
  IsKey: boolean;
  SdsType: SdsType;
}
