import { SdsNamespace } from './sds-namespace';

/** A stream configuration for the chart */
export interface StreamConfig {
  namespace: SdsNamespace;
  stream: string;
  key: string;
  valueFields: string[];
  lastUpdate?: string;
  lastCount?: number;
}
