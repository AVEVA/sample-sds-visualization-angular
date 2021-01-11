import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { Chart } from 'chart.js';
import { interval, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  AppSettings,
  SETTINGS,
  SdsStream,
  SdsType,
  SdsTypeCode,
  SdsTypeCodeMap,
  SdsNamespace,
} from '~/models';
import { SdsProperty } from '~/models/sds-property';
import { StreamConfig } from '~/models/stream-config';
import { SdsService } from '~/services';

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild('canvas') canvasEl: ElementRef;

  // Form Controls
  namespaceCtrl = new FormControl();
  streamCtrl = new FormControl();
  streamForm = new FormGroup({
    namespace: this.namespaceCtrl,
    stream: this.streamCtrl,
  });
  eventsCtrl = new FormControl('100');
  refreshCtrl = new FormControl('5');
  chartForm = new FormGroup({
    events: this.eventsCtrl,
    refresh: this.refreshCtrl,
  });

  /** Number of ms to wait after form control changes */
  debounce = 500;
  /** Chart.js Chart */
  chart: Chart;
  /** Refresh timer */
  refresh$ = interval(5000);
  /** Refresh subscription, which should be cleaned up */
  subscription: Subscription;
  /** List of namespaces in the tenant */
  namespaces: { [id: string]: SdsNamespace } = {};
  /** List of supported types in the namespace */
  types: SdsType[] = [];
  /** List of supported streams in the namespace */
  streams: SdsStream[] = [];
  /** Suggested refresh interval options */
  refresh: number[] = [5, 15, 60, 300, 60000];
  /** Suggested number of events options */
  events: number[] = [10, 50, 100, 500, 1000];
  /** Displayed columns in streams table */
  displayedColumns: string[] = [
    'namespace',
    'stream',
    'lastUpdate',
    'lastCount',
  ];
  /** Whether the Chart is currently using time as an index, vs numeric index. All streams should match. */
  isTime: boolean;
  /** List of stream configurations that have been added */
  configs: StreamConfig[] = [];

  /** Whether to disable the stream add button, the stream must be supported and have an allowed key */
  get streamFormDisabled(): boolean {
    const stream = this.streams.find((s) => s.Id === this.streamCtrl.value);
    const type = this.types.find((t) => t.Id === stream?.TypeId);
    const key = type?.Properties?.find((p) => this.isPropertyKey(p));
    const isTime = key && key.SdsType.SdsTypeCode === SdsTypeCode.DateTime;
    return isTime == null || (this.isTime != null && this.isTime !== isTime);
  }

  constructor(
    public sds: SdsService,
    @Inject(SETTINGS) public settings: AppSettings
  ) {}

  /** Set up the component when Angular is ready */
  ngOnInit(): void {
    this.sds.getNamespaces().subscribe((r) => {
      this.namespaces = r.reduce((e: { [id: string]: SdsNamespace }, n) => {
        e[n.Id] = n;
        return e;
      }, {});
    });
    this.namespaceCtrl.valueChanges
      .pipe(debounceTime(this.debounce))
      .subscribe((v) => this.namespaceChanges(v));
    this.streamCtrl.valueChanges
      .pipe(debounceTime(this.debounce))
      .subscribe((v) => this.queryStreams(this.namespaceCtrl.value, v));
    this.eventsCtrl.valueChanges
      .pipe(debounceTime(this.debounce))
      .subscribe(() => this.updateData());
    this.refreshCtrl.valueChanges
      .pipe(debounceTime(this.debounce))
      .subscribe((v) => this.refreshChanges(v));
    this.setupRefresh(interval(5000));
  }

  /** Fired when component is left, to clean up */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /** Sets up a new refresh interval timer and cleans up old subscription */
  setupRefresh(int: Observable<number>): void {
    this.subscription?.unsubscribe();
    this.refresh$ = int;
    this.subscription = this.refresh$.subscribe(() => this.updateData());
  }

  /** Handles changes to namespace control, queries for supported types and streams */
  namespaceChanges(namespace: string): void {
    if (this.namespaces[namespace]) {
      this.sds.getTypes(this.namespaces[namespace]).subscribe((r) => {
        this.types = r.filter((t) => this.isTypeSupported(t));
        this.queryStreams(namespace, this.streamCtrl.value);
      });
    }
  }

  /** Handles changes to refresh control, sets up new refresh interval timer */
  refreshChanges(refresh: string): void {
    const num = Number(refresh);
    if (!isNaN(num)) {
      this.setupRefresh(interval(num * 1000));
    }
  }

  /** Whether the passed type is supported, must be an object with valid index */
  isTypeSupported(type: SdsType): boolean {
    return (
      type.SdsTypeCode === SdsTypeCode.Object &&
      type.Properties.some((p) => this.isPropertyKey(p))
    );
  }

  /** Whether the passed property is a supported index, must be order 0 and supported SdsTypeCode */
  isPropertyKey(prop: SdsProperty): boolean {
    return (
      prop.IsKey &&
      (prop.Order || 0) === 0 &&
      SdsTypeCodeMap[prop.SdsType.SdsTypeCode] > 0
    );
  }

  /** Query for streams in a namespace and filter for streams with supported type */
  queryStreams(namespace: string, query: string): void {
    if (this.namespaces[namespace]) {
      this.sds.getStreams(this.namespaces[namespace], query).subscribe((r) => {
        this.streams = r.filter((s) =>
          this.types.some((t) => s.TypeId === t.Id)
        );
      });
    }
  }

  /** Add a stream to the chart */
  addStream(): void {
    // console.log(this.streamCtrl.value);
    const stream = this.streams.find((s) => s.Id === this.streamCtrl.value);
    const type = this.types.find((t) => t.Id === stream.TypeId);
    const key = type.Properties.find((p) => this.isPropertyKey(p));
    // This should either initialize isTime or not change its value
    this.isTime = key.SdsType.SdsTypeCode === SdsTypeCode.DateTime;
    const config: StreamConfig = {
      namespace: this.namespaces[this.namespaceCtrl.value],
      stream: stream.Id,
      key: key.Id,
      valueFields: type.Properties.filter(
        (p) => !p.IsKey && SdsTypeCodeMap[p.SdsType.SdsTypeCode]
      ).map((p) => p.Id),
    };
    this.configs.push(config);

    if (!this.chart) {
      this.chart = this.getChart();
    }

    for (const k of config.valueFields) {
      const color = this.getColor();
      this.chart.data.datasets.push({
        label: `${config.stream}.${k}`,
        borderColor: color,
        fill: false,
        data: [],
      });
    }
    this.chart.update();
    this.updateData();
    this.streamCtrl.setValue('');
    this.table?.renderRows();
  }

  /** Gets a new chart object with configuration */
  getChart(): Chart {
    return new Chart(this.canvasEl.nativeElement, {
      type: 'line',
      data: {
        datasets: [],
      },
      options: {
        responsive: false,
        scales: {
          xAxes: [
            {
              type: this.isTime ? 'time' : 'linear',
              position: 'bottom',
            },
          ],
          yAxes: [
            {
              type: 'linear',
              position: 'left',
            },
          ],
        },
      },
    });
  }

  /** Uses configuration objects to query SDS and get latest data for the chart */
  updateData(): void {
    const events = this.eventsCtrl.value;
    for (const s of this.configs) {
      this.sds.getLastValue(s.namespace, s.stream).subscribe((last) => {
        const startIndex = last[s.key];
        this.sds
          .getRangeValues(
            s.namespace,
            s.stream,
            startIndex,
            Number(events),
            true
          )
          .subscribe((data: any[]) => {
            if (data?.length > 0) {
              const datasets: { [key: string]: Chart.ChartPoint[] } = {};
              for (const f of s.valueFields) {
                datasets[`${s.stream}.${f}`] = [];
              }
              for (const e of data) {
                const keyVal = e[s.key];
                const x = this.isTime ? new Date(keyVal) : keyVal;
                for (const f of s.valueFields) {
                  datasets[`${s.stream}.${f}`].push({ x, y: e[f] });
                }
              }
              this.updateChart(datasets);
            }

            s.lastUpdate = new Date().toString();
            s.lastCount = data?.length || 0;
          });
      });
    }
  }

  /** Applies latest data for fields of a specific stream to the chart */
  updateChart(datasets: { [key: string]: Chart.ChartPoint[] }): void {
    this.chart.data.datasets.forEach((d) => {
      if (datasets[d.label]) {
        d.data = datasets[d.label];
      }
    });

    this.chart.update();
  }

  /** Gets a new random color for a trend in the chart */
  getColor(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  }
}
