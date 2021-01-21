import { DisplayType } from './display-type';
import { SdsTypeCode } from './sds-type-code';

/** These SDS Type Codes are supported by the application */
export const SdsTypeCodeMap = {
  [SdsTypeCode.Object]: DisplayType.None,
  [SdsTypeCode.Int16]: DisplayType.Number,
  [SdsTypeCode.UInt16]: DisplayType.Number,
  [SdsTypeCode.Int32]: DisplayType.Number,
  [SdsTypeCode.UInt32]: DisplayType.Number,
  [SdsTypeCode.Int64]: DisplayType.Number,
  [SdsTypeCode.UInt64]: DisplayType.Number,
  [SdsTypeCode.Single]: DisplayType.Number,
  [SdsTypeCode.Double]: DisplayType.Number,
  [SdsTypeCode.Decimal]: DisplayType.Number,
  [SdsTypeCode.DateTime]: DisplayType.DateTime,
  [SdsTypeCode.NullableInt16]: DisplayType.Number,
  [SdsTypeCode.NullableUInt16]: DisplayType.Number,
  [SdsTypeCode.NullableInt32]: DisplayType.Number,
  [SdsTypeCode.NullableUInt32]: DisplayType.Number,
  [SdsTypeCode.NullableInt64]: DisplayType.Number,
  [SdsTypeCode.NullableUInt64]: DisplayType.Number,
  [SdsTypeCode.NullableSingle]: DisplayType.Number,
  [SdsTypeCode.NullableDouble]: DisplayType.Number,
  [SdsTypeCode.NullableDecimal]: DisplayType.Number,
  [SdsTypeCode.NullableDateTime]: DisplayType.Number,
};
