/**
 * SDS Type Code enumeration, see
 * {@link https://docs.osisoft.com/bundle/data-hub/page/developer-guide/sequential-data-store-dev/sds-types-dev.html#sdstypecode|ADH Documentation} and
 * {@link https://docs.osisoft.com/bundle/edge-data-store/page/sds/types/sds-type-code.html|EDS Documentation}
 */
export enum SdsTypeCodeNumeric {
  'Object' = 1,
  'Int16' = 7,
  'UInt16',
  'Int32',
  'UInt32',
  'Int64',
  'UInt64',
  'Single',
  'Double',
  'Decimal',
  'DateTime',
  'NullableInt16' = 107,
  'NullableUInt16',
  'NullableInt32',
  'NullableUInt32',
  'NullableInt64',
  'NullableUInt64',
  'NullableSingle',
  'NullableDouble',
  'NullableDecimal',
  'NullableDateTime',
}
