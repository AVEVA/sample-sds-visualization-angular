import { SdsType } from './sds-type';

/**
 * SDS Type Property representation, see
 * {@link https://docs.osisoft.com/bundle/data-hub/page/developer-guide/sequential-data-store-dev/sds-types-dev.html#sdstypeproperty|Cds Documentation}
 * and {@link https://docs.osisoft.com/bundle/edge-data-store/page/sds/types/sds-type-property.html|EDS Documentation}
 */
export interface SdsTypeProperty {
  Id: string;
  Name: string;
  Description: string;
  Order: number;
  IsKey: boolean;
  SdsType: SdsType;
}
