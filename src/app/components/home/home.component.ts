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
import { interval, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  AppSettings,
  SETTINGS,
  SdsStream,
  SdsType,
  SdsTypeCode,
  SdsTypeCodeMap,
} from '~/models';
import { SdsProperty } from '~/models/sds-property';
import { StreamConfig } from '~/models/stream-config';
import { SdsService } from '~/services';

const DEBOUNCE_TIME = 500;

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild('canvas') canvasEl: ElementRef;

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
  chart: Chart;
  refresh$ = interval(5000);
  subscription: Subscription;

  namespaces: string[] = [];
  types: SdsType[] = [];
  streams: SdsStream[] = [];
  refresh: number[] = [5, 15, 60, 300, 60000];
  events: number[] = [10, 50, 100, 500, 1000];
  displayedColumns: string[] = [
    'namespace',
    'stream',
    'lastUpdate',
    'lastCount',
  ];

  isTime: boolean;
  configs: StreamConfig[] = [];

  get streamFormDisabled(): boolean {
    return (
      this.namespaces.indexOf(this.namespaceCtrl.value) === -1 ||
      this.streams.find((s) => s.Id === this.streamCtrl.value) == null
    );
  }

  constructor(
    public sds: SdsService,
    @Inject(SETTINGS) public settings: AppSettings
  ) {}

  ngOnInit(): void {
    this.sds.getNamespaces().subscribe((r) => {
      this.namespaces = r;
    });
    this.namespaceCtrl.valueChanges
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe((v) => this.namespaceChanges(v));
    this.streamCtrl.valueChanges
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe((v) => this.streamChanges(v));
    this.eventsCtrl.valueChanges
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe(this.updateData);
    this.refreshCtrl.valueChanges
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe((v) => this.refreshChanges(v));
    this.subscription = this.refresh$.subscribe(() => this.updateData());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  namespaceChanges(namespace: string): void {
    this.queryTypes(namespace);
    this.queryStreams(namespace, this.streamCtrl.value);
  }

  streamChanges(stream: string): void {
    this.queryStreams(this.namespaceCtrl.value, stream);
  }

  refreshChanges(refresh: string): void {
    const num = Number(refresh);
    if (!isNaN(num)) {
      this.subscription.unsubscribe();
      this.refresh$ = interval(num * 1000);
      this.subscription = this.refresh$.subscribe(() => this.updateData());
    }
  }

  isTypeSupported(type: SdsType): boolean {
    return (
      type.SdsTypeCode === SdsTypeCode.Object &&
      type.Properties.some((p) => this.isPropertyKey(p))
    );
  }

  isPropertyKey(prop: SdsProperty): boolean {
    return (
      prop.IsKey &&
      (prop.Order || 0) === 0 &&
      SdsTypeCodeMap[prop.SdsType.SdsTypeCode] != null
    );
  }

  queryTypes(namespace: string): void {
    this.sds.getTypes(namespace).subscribe((r) => {
      this.types = r.filter((t) => this.isTypeSupported(t));
    });
  }

  queryStreams(namespace: string, query: string): void {
    if (this.namespaces.indexOf(namespace) !== -1) {
      this.sds.getStreams(namespace, query).subscribe((r) => {
        this.streams = r.filter((s) =>
          this.types.some((t) => s.TypeId === t.Id)
        );
      });
    }
  }

  addStream(): void {
    const stream = this.streams.find((s) => s.Id === this.streamCtrl.value);
    if (stream) {
      const type = this.types.find((t) => t.Id === stream.TypeId);
      const key = type.Properties.find((p) => this.isPropertyKey(p));
      if (type && key) {
        const isTime = key.SdsType.SdsTypeCode === SdsTypeCode.DateTime;
        if (this.isTime != null && this.isTime !== isTime) {
          console.warn('Stream index type does not match');
        } else {
          this.isTime = isTime;
          const config: StreamConfig = {
            namespace: this.namespaceCtrl.value,
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

          if (this.table) {
            this.table.renderRows();
          }
        }
      }
    }
  }

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
            } else {
              console.warn('No data found for time range');
            }

            s.lastUpdate = new Date().toString();
            s.lastCount = data.length;
          });
      });
    }
  }

  updateChart(datasets: { [key: string]: Chart.ChartPoint[] }): void {
    this.chart.data.datasets.forEach((d) => {
      if (datasets[d.label]) {
        d.data = datasets[d.label];
      }
    });

    this.chart.update();
  }

  getColor(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  }
}
