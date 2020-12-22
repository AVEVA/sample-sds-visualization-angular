import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Chart } from 'chart.js';
import { interval } from 'rxjs';

import {
  AppSettings,
  DEFAULT,
  DIAGNOSTICS,
  Namespace,
  SETTINGS,
  Stream,
} from 'src/app/models';

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasEl: ElementRef;

  namespaceCtrl = new FormControl();
  streamCtrl = new FormControl();
  hoursCtrl = new FormControl('8');
  formGroup = new FormGroup({
    namespace: this.namespaceCtrl,
    stream: this.streamCtrl,
  });
  chart: Chart;
  chartConfig: Chart.ChartConfiguration = {
    type: 'line',
    data: {
      datasets: [{ label: '', data: [] }],
    },
    options: {
      responsive: false,
      scales: {
        xAxes: [
          {
            type: 'time',
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
  };
  refresh$ = interval(5000);

  ocsNamespaces: string[] = [];
  streams: string[] = [];
  hours: number[] = [0.5, 1, 8, 12, 24, 48];

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
        const namespaces = r as Namespace[];
        this.ocsNamespaces = namespaces.map((n) => n.Id);
      },
      (e) => {
        console.warn('Error getting namespaces:');
        console.warn(e);
      }
    );
    this.namespaceCtrl.valueChanges.subscribe((v) =>
      this.queryStreams(v, this.streamCtrl.value)
    );
    this.streamCtrl.valueChanges.subscribe((v) =>
      this.queryStreams(this.namespaceCtrl.value, v)
    );
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvasEl.nativeElement, this.chartConfig);
    this.refresh$.subscribe(() => this.updateData());
  }

  queryStreams(namespace: string, query: string): void {
    this.http
      .get(`${this.baseUrl}/${namespace}/Streams?query=${query}*`)
      .subscribe(
        (r) => {
          const streams = r as Stream[];
          this.streams = streams.map((s) => s.Id);
        },
        (e) => {
          console.warn('Error getting streams:');
          console.warn(e);
        }
      );
  }

  updateData(): void {
    if (
      this.namespaceCtrl.value &&
      this.streamCtrl.value &&
      this.hoursCtrl.value
    ) {
      const now = new Date();
      const nowUtc = now.toISOString();
      now.setHours(now.getHours() - this.hoursCtrl.value);
      const startUtc = now.toISOString();
      this.http
        .get(
          `${this.baseUrl}/${this.namespaceCtrl.value}/Streams/${this.streamCtrl.value}/Data?startIndex=${startUtc}&endIndex=${nowUtc}`
        )
        .subscribe(
          (r: any[]) => {
            if (r?.length > 0) {
              // Find timestamp field
              const tsField = Object.keys(r[0]).find(
                (k) => !isNaN(Date.parse(r[0][k]))
              );
              const valueFields = Object.keys(r[0]).filter(
                (k) => k !== tsField
              );
              const datasets: { [key: string]: Chart.ChartPoint[] } = {};
              for (const f of valueFields) {
                datasets[f] = [];
              }
              for (const e of r) {
                const x = new Date(e[tsField]);
                for (const f of valueFields) {
                  datasets[f].push({ x, y: e[f] });
                }
              }
              this.updateChart(datasets);
            } else {
              console.warn('No data found for time range');
            }
          },
          (e) => {
            console.warn('Error getting stream data:');
            console.warn(e);
          }
        );
    }
  }

  updateChart(datasets: { [key: string]: Chart.ChartPoint[] }): void {
    while (this.chart.data.datasets?.length) {
      this.chart.data.datasets.pop();
    }

    for (const k of Object.keys(datasets)) {
      this.chart.data.datasets.push({ label: k, data: datasets[k] });
    }

    this.chart.update();
  }
}
