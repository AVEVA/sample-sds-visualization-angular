import { SdsTypeProperty } from './sds-property';
import { SdsTypeCode } from './sds-type-code';

/**
 * SDS Type representation, see
 * {@link https://docs.osisoft.com/bundle/data-hub/page/add-organize-data/store-data/types/types-concept.html|ADH Documentation} and
 * {@link https://docs.osisoft.com/bundle/edge-data-store/page/sds/sds-types.html|EDS Documentation}
 */
export interface SdsType {
  Id: string;
  Name: string;
  Description: string;
  SdsTypeCode: SdsTypeCode;
  Properties: SdsTypeProperty[] | null;
}
