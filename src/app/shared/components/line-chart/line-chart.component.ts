import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { LineChartService } from '@app/shared/services/line-chart/line-chart.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, OnDestroy {
  chartOption: any;
  @Input() lineChartOptions;
  echartsInstance: any;
  theme: any;
  chartData: any;
  isChartLoading: boolean;
  chartUpdation: Subscription;
  pageUpdation: Subscription;
  constants: any;
  legends: any;
  isChartOptionsInitialized = false;
  // Included for selenium testing
  inputId: string;
  last15MinData: any;
  themeSubscription: Subscription;

  constructor(
    private customTheme: CustomThemeService,
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private lineChartService: LineChartService,
    private config: AppConfigService
  ) {}

  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.initChartDataUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.lineChartOptions.id) {
      this.inputId = this.lineChartOptions.id;
    }
  }

  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changeLineGraphTheme();
    });
  }

  initChartDataUpdation() {
    this.chartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async () => {
      this.isChartLoading = true;
      try {
        let timeSlot;
        if (this.dataUpdateService.selectedDateRange) {
          const dates = this.dataUpdateService.selectedDates;
          timeSlot = this.dataUpdateService.selectedDateRange;
          this.chartData = await this.getLineChartData(timeSlot, dates[0], dates[1]);
        } else {
          timeSlot = this.dataUpdateService.selectedTimeRange;
          this.chartData = await this.getLineChartData(timeSlot);
        }
        const processedData = this.chartService.processChartData(this.chartData);
        const timeRange = this.dataUpdateService.graphTimeRange;
        if (!this.isChartOptionsInitialized) {
          this.chartOption = this.lineChartService.initLineChartOption(this.theme, processedData, timeRange, this.lineChartOptions);
          if (this.chartData) {
            this.isChartOptionsInitialized = true;
          }
          this.chartService.storeTestData(this.inputId, this.chartData);
        } else {
          this.chartOption = this.lineChartService.updateChartData(
            this.chartOption,
            processedData,
            timeRange,
            this.theme,
            this.lineChartOptions
          );
          if (this.echartsInstance) {
            this.echartsInstance.clear();
            this.echartsInstance.setOption(this.chartOption);
            this.chartService.storeTestData(this.inputId, this.chartData);
          }
        }
      } catch (err) {
        this.dashBoard.logError(err);
      } finally {
        this.isChartLoading = false;
      }
    });
  }

  onReSize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
      }, this.constants.chartResizeTimeout);
    }
  }

  getLineChartData(timeSlot, dateStartTime?, dateEndTime?) {
    if (!this.lineChartOptions.dataEndPoint) {
      return null;
    } else {
      let params = {
        parameter: this.lineChartOptions.parameter,
        timeSlot
      };
      if (dateStartTime && dateEndTime) {
        params['startTime'] = dateStartTime;
        params['endTime'] = dateEndTime;
      }

      if (this.lineChartOptions && this.lineChartOptions.colMapID) {
        params['colMapID'] = this.lineChartOptions.colMapID;
      }
      return this.dashBoard.getDashBoardData(this.lineChartOptions.dataEndPoint, params, this.lineChartOptions.isPostReq);
    }
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  changeLineGraphTheme() {
    this.chartOption = this.chartService.changeChartTheme(this.chartOption, this.theme);
    this.echartsInstance.setOption(this.chartOption);
  }

  saveImage() {
    this.chartService.downloadChart(this.echartsInstance);
  }

  ngOnDestroy() {
    if (this.chartUpdation) {
      this.chartUpdation.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
