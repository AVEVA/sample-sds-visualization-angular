export interface StreamConfig {
  namespace: string;
  stream: string;
  key: string;
  valueFields: string[];
  lastUpdate?: string;
  lastCount?: number;
}
