import { SdsNamespace } from './sds-namespace';

export interface StreamConfig {
  namespace: SdsNamespace;
  stream: string;
  key: string;
  valueFields: string[];
  lastUpdate?: string;
  lastCount?: number;
}
