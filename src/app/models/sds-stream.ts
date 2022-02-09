/**
 * SDS Stream representation, see
 * {@link https://docs.osisoft.com/bundle/data-hub/page/add-organize-data/store-data/streams/streams-concept.html|ADH Documentation} and
 * {@link https://docs.osisoft.com/bundle/edge-data-store/page/sds/sds-streams.html|EDS Documentation}
 */
export interface SdsStream {
  Id: string;
  Name: string;
  Description: string;
  TypeId: string;
}
