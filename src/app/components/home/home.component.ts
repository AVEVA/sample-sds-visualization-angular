import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Chart } from 'chart.js';
import { interval } from 'rxjs';
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
import { SdsService } from '~/services';

const DEBOUNCE_TIME = 500;

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('canvas') canvasEl: ElementRef;

  namespaceCtrl = new FormControl();
  streamCtrl = new FormControl();
  eventsCtrl = new FormControl('100');
  formGroup = new FormGroup({
    namespace: this.namespaceCtrl,
    stream: this.streamCtrl,
    events: this.eventsCtrl,
  });
  chart: Chart;
  refresh$ = interval(5000);

  namespaces: string[] = [];
  types: SdsType[] = [];
  streams: SdsStream[] = [];
  key: string;
  isTime: boolean;
  valueFields: string[];
  events: number[] = [10, 50, 100, 500, 1000];

  lastUpdate: string;
  lastCount: number;

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
      .subscribe(this.namespaceChanges);
    this.streamCtrl.valueChanges
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe(this.streamChanges);
    this.eventsCtrl.valueChanges
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe(this.updateData);
    this.refresh$.subscribe(this.updateData);
  }

  namespaceChanges(namespace: string): void {
    this.queryTypes(namespace);
    this.queryStreams(namespace, this.streamCtrl.value);
  }

  streamChanges(stream: string): void {
    this.queryStreams(this.namespaceCtrl.value, stream);
    this.setupDatasets(stream);
  }

  isTypeSupported(type: SdsType): boolean {
    return (
      type.SdsTypeCode === SdsTypeCode.Object &&
      type.Properties.some(this.isPropertyKey)
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
      this.types = r.filter(this.isTypeSupported);
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

  setupDatasets(streamId: string): void {
    this.lastUpdate = null;
    this.lastCount = null;
    const stream = this.streams.find((s) => s.Id === streamId);
    if (stream) {
      const type = this.types.find((t) => t.Id === stream.TypeId);
      const key = type.Properties.find(this.isPropertyKey);
      if (key) {
        this.key = key.Id;
        this.isTime = key.SdsType.SdsTypeCode === SdsTypeCode.DateTime;
        if (this.chart) {
          this.chart.destroy();
        }
        this.chart = this.getChart();
        if (type) {
          this.valueFields = type.Properties.filter(
            (p) => !p.IsKey && SdsTypeCodeMap[p.SdsType.SdsTypeCode]
          ).map((p) => p.Id);
          for (const k of this.valueFields) {
            const color = this.getColor();
            this.chart.data.datasets.push({
              label: k,
              borderColor: color,
              fill: false,
              data: [],
            });
          }
          this.chart.update();
          this.updateData();
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
    const namespace = this.namespaceCtrl.value;
    const stream = this.streamCtrl.value;
    const events = this.eventsCtrl.value;
    if (
      this.namespaces.indexOf(namespace) !== -1 &&
      this.streams.some((s) => s.Id === stream) &&
      events
    ) {
      this.sds.getLastValue(namespace, stream).subscribe((last) => {
        const startIndex = last[this.key];
        this.sds
          .getRangeValues(namespace, stream, startIndex, Number(events), true)
          .subscribe((data: any[]) => {
            if (data?.length > 0) {
              const datasets: { [key: string]: Chart.ChartPoint[] } = {};
              for (const f of this.valueFields) {
                datasets[f] = [];
              }
              for (const e of data) {
                const keyVal = e[this.key];
                const x = this.isTime ? new Date(keyVal) : keyVal;
                for (const f of this.valueFields) {
                  datasets[f].push({ x, y: e[f] });
                }
              }
              this.updateChart(datasets);
            } else {
              console.warn('No data found for time range');
            }

            this.lastUpdate = new Date().toString();
            this.lastCount = data.length;
          });
      });
    }
  }

  updateChart(datasets: { [key: string]: Chart.ChartPoint[] }): void {
    this.chart.data.datasets.forEach((d) => {
      d.data = datasets[d.label];
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
