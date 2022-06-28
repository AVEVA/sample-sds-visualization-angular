import { OrganizationUnit } from './organization-unit';
import { SdsStream } from './sds-stream';

/** A stream configuration for the chart */
export interface StreamConfig {
  unit: OrganizationUnit;
  stream: SdsStream;
  key: string;
  valueFields: string[];
  lastUpdate?: string;
  lastCount?: number;
}
