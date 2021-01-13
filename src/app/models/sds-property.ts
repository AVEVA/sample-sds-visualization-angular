import { SdsType } from './sds-type';

/**
 * SDS Type Property representation, see
 * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/SequentialDataStore/SDS_Types.html#sdstypeproperty|OCS Documentation}
 * and {@link https://osisoft.github.io/Edge-Data-Store-Docs/V1/SDS/Types/SdsTypeProperty_1-0.html|EDS Documentation}
 */
export interface SdsTypeProperty {
  Id: string;
  Name: string;
  Description: string;
  Order: number;
  IsKey: boolean;
  SdsType: SdsType;
}
