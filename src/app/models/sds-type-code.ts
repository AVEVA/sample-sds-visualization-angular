/**
 * SDS Type Code enumeration, see
 * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/SequentialDataStore/SDS_Types.html#sdstypecode|ADH Documentation} and
 * {@link https://osisoft.github.io/Edge-Data-Store-Docs/V1/SDS/Types/SdsTypeCode_1-0.html|EDS Documentation}
 */
export enum SdsTypeCode {
  Object = 1,
  Int16 = 7,
  UInt16 = 8,
  Int32 = 9,
  UInt32 = 10,
  Int64 = 11,
  UInt64 = 12,
  Single = 13,
  Double = 14,
  Decimal = 15,
  DateTime = 16,
  NullableInt16 = 107,
  NullableUInt16 = 108,
  NullableInt32 = 109,
  NullableUInt32 = 110,
  NullableInt64 = 111,
  NullableUInt64 = 112,
  NullableSingle = 113,
  NullableDouble = 114,
  NullableDecimal = 115,
  NullableDateTime = 116,
}
