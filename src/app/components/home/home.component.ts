import { HttpClient } from '@angular/common/http';
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
  DEFAULT,
  DIAGNOSTICS,
  SdsNamespace,
  SETTINGS,
  SdsStream,
  SdsType,
  SdsTypeCode,
  SdsTypeCodeMap,
} from 'src/app/models';

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

  ocsNamespaces: string[] = [];
  supportedTypes: SdsType[] = [];
  streams: SdsStream[] = [];
  key: string;
  isTime: boolean;
  valueFields: string[];
  events: number[] = [10, 50, 100, 500, 1000];

  lastUpdate: string;
  lastCount: number;

  get namespaces(): string[] {
    if (this.settings.TenantId === DEFAULT) {
      return [DEFAULT, DIAGNOSTICS];
    } else {
      return this.ocsNamespaces;
    }
  }

  get baseUrl(): string {
    return `${this.settings.Resource}/api/${this.settings.ApiVersion}/Tenants/${this.settings.TenantId}/Namespaces`;
  }

  constructor(
    public http: HttpClient,
    @Inject(SETTINGS) public settings: AppSettings
  ) {}

  ngOnInit(): void {
    this.http.get(this.baseUrl).subscribe(
      (r) => {
        const namespaces = r as SdsNamespace[];
        this.ocsNamespaces = namespaces.map((n) => n.Id);
      },
      (e) => {
        console.warn('Error getting namespaces:');
        console.warn(e);
      }
    );
    this.namespaceCtrl.valueChanges.pipe(debounceTime(500)).subscribe((v) => {
      this.queryTypes(v);
      this.queryStreams(v, this.streamCtrl.value);
    });
    this.streamCtrl.valueChanges.pipe(debounceTime(500)).subscribe((v) => {
      this.queryStreams(this.namespaceCtrl.value, v);
      this.setupDatasets(v);
    });
    this.eventsCtrl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((v) => this.updateData());
    this.refresh$.subscribe(() => this.updateData());
  }

  queryTypes(namespace: string): void {
    this.http.get(`${this.baseUrl}/${namespace}/Types`).subscribe(
      (r) => {
        const types = r as SdsType[];
        this.supportedTypes = types.filter(
          (t) =>
            t.SdsTypeCode === SdsTypeCode.Object &&
            t.Properties.some(
              (p) =>
                p.IsKey &&
                (p.Order || 0) === 0 &&
                SdsTypeCodeMap[p.SdsType.SdsTypeCode]
            )
        );
        console.log(r);
        console.log(this.supportedTypes);
      },
      (e) => {
        console.warn('Error getting types:');
        console.warn(e);
      }
    );
  }

  queryStreams(namespace: string, query: string): void {
    if (this.namespaces.indexOf(namespace) !== -1) {
      this.http
        .get(`${this.baseUrl}/${namespace}/Streams?query=${query || ''}*`)
        .subscribe(
          (r) => {
            const streams = r as SdsStream[];
            this.streams = streams.filter((s) =>
              this.supportedTypes.some((t) => s.TypeId === t.Id)
            );
          },
          (e) => {
            console.warn('Error getting streams:');
            console.warn(e);
          }
        );
    }
  }

  setupDatasets(streamId: string): void {
    this.lastUpdate = null;
    this.lastCount = null;
    const stream = this.streams.find((s) => s.Id === streamId);
    if (stream) {
      const type = this.supportedTypes.find((t) => t.Id === stream.TypeId);
      const key = type.Properties.find(
        (p) =>
          p.IsKey && (p.Order || 0) === 0 && SdsTypeCode[p.SdsType.SdsTypeCode]
      );
      if (key) {
        console.log(key);
        this.key = key.Id;
        this.isTime = key.SdsType.SdsTypeCode === SdsTypeCode.DateTime;
        if (this.chart) {
          this.chart.destroy();
        }
        this.chart = new Chart(this.canvasEl.nativeElement, {
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
        if (type) {
          this.valueFields = type.Properties.filter(
            (p) => !p.IsKey && SdsTypeCodeMap[p.SdsType.SdsTypeCode]
          ).map((p) => p.Id);
          for (const k of this.valueFields) {
            const color = this.getColor();
            console.log(color);
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

  updateData(): void {
    if (
      this.namespaces.indexOf(this.namespaceCtrl.value) !== -1 &&
      this.streams.some((s) => s.Id === this.streamCtrl.value) &&
      this.eventsCtrl.value
    ) {
      this.http
        .get(
          `${this.baseUrl}/${this.namespaceCtrl.value}/Streams/${this.streamCtrl.value}/Data/Last`
        )
        .subscribe(
          (last) => {
            const startIndex = last[this.key];
            this.http
              .get(
                `${this.baseUrl}/${this.namespaceCtrl.value}/Streams/${this.streamCtrl.value}/Data?startIndex=${startIndex}&count=${this.eventsCtrl.value}&reversed=true`,
                {
                  headers: {
                    Accept: 'application/json',
                    'Accept-Verbosity': 'verbose',
                  },
                }
              )
              .subscribe(
                (data: any[]) => {
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
                },
                (e) => {
                  console.warn('Error getting values:');
                  console.warn(e);
                }
              );
          },
          (e) => {
            console.warn('Error getting last value:');
            console.warn(e);
          }
        );
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
