import { OrganizationUnit } from './organization-unit';

/** A stream configuration for the chart */
export interface StreamConfig {
  unit: OrganizationUnit;
  stream: string;
  key: string;
  valueFields: string[];
  lastUpdate?: string;
  lastCount?: number;
}
