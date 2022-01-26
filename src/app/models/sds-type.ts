import { SdsTypeProperty } from './sds-property';
import { SdsTypeCode } from './sds-type-code';

/**
 * SDS Type representation, see
 * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/SequentialDataStore/SDS_Types.html|ADH Documentation} and
 * {@link https://osisoft.github.io/Edge-Data-Store-Docs/V1/SDS/SDS_Types_1-0.html|EDS Documentation}
 */
export interface SdsType {
  Id: string;
  Name: string;
  Description: string;
  SdsTypeCode: SdsTypeCode;
  Properties: SdsTypeProperty[] | null;
}
