/**
 * SDS Stream representation, see
 * {@link https://ocs-docs.osisoft.com/Content_Portal/Documentation/SequentialDataStore/SDS_Streams.html|OCS Documentation} and
 * {@link https://osisoft.github.io/Edge-Data-Store-Docs/V1/SDS/SDS_Streams_1-0.html|EDS Documentation}
 */
export interface SdsStream {
  Id: string;
  Name: string;
  Description: string;
  TypeId: string;
}
