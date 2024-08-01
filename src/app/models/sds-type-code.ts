/**
 * SDS Type Code enumeration, see
 * {@link https://docs.osisoft.com/bundle/data-hub/page/developer-guide/sequential-data-store-dev/sds-types-dev.html#sdstypecode|Cds Documentation} and
 * {@link https://docs.osisoft.com/bundle/edge-data-store/page/sds/types/sds-type-code.html|EDS Documentation}
 */
export enum SdsTypeCode {
  Object = 'Object',
  Int16 = 'Int16',
  UInt16 = 'UInt16',
  Int32 = 'Int32',
  UInt32 = 'UInt32',
  Int64 = 'Int64',
  UInt64 = 'UInt64',
  Single = 'Single',
  Double = 'Double',
  Decimal = 'Decimal',
  DateTime = 'DateTime',
  NullableInt16 = 'NullableInt16',
  NullableUInt16 = 'NullableUInt16',
  NullableInt32 = 'NullableInt32',
  NullableUInt32 = 'NullableUInt32',
  NullableInt64 = 'NullableInt64',
  NullableUInt64 = 'NullableUInt64',
  NullableSingle = 'NullableSingle',
  NullableDouble = 'NullableDouble',
  NullableDecimal = 'NullableDecimal',
  NullableDateTime = 'NullableDateTime',
}
