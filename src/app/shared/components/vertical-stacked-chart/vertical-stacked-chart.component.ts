import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

@Component({
  selector: 'app-vertical-stacked-chart',
  templateUrl: './vertical-stacked-chart.component.html',
  styleUrls: ['./vertical-stacked-chart.component.scss']
})
export class VerticalStackedChartComponent implements OnInit, OnDestroy {
  verticalStackedChartConfig: any;
  @Input() verticalStackOptions;
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
  timeSlot: any;
  highestZoomLevel: number;
  deviceId: string;
  isDataEmpty = true;
  titleString: any;

  constructor(
    private customTheme: CustomThemeService,
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private config: AppConfigService
  ) {}
  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.setTitle();
    this.initChartUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.verticalStackOptions.id) {
      this.inputId = this.verticalStackOptions.id;
    }
  }

  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changeVerticalStackedChartTheme();
    });
  }

  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.verticalStackOptions, timeInfo);
  }

  initChartUpdation() {
    if (this.verticalStackOptions.deviceDependentRefresh) {
      this.chartUpdation = this.dataUpdateService.updateDeviceData$.subscribe(async event => {
        if (event) {
          this.deviceId = event.id;
          this.initChartDataUpdation(event.type);
        }
      });
    } else {
      this.chartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
        this.deviceId = null;
        this.initChartDataUpdation(event);
      });
    }
  }

  async initChartDataUpdation(event?) {
    try {
      this.isChartLoading = true;
      if (event && !this.constants.refreshEvents.includes(event)) {
        this.setTitle();
      }
      this.timeSlot = this.dataUpdateService.selectedDateRange
        ? this.dataUpdateService.selectedDateRange
        : this.dataUpdateService.selectedTimeRange;
      this.highestZoomLevel = this.chartService.getZoomLevel(this.timeSlot);
      const { dataZoomOption, requiredTimeRange, startDate, endDate } = this.chartService.getZoomDataOptions(
        event,
        this.echartsInstance,
        this.timeSlot,
        this.highestZoomLevel
      );
      this.chartData = await this.getVerticalStackedChartData(requiredTimeRange, startDate, endDate);
      const processedData = this.chartService.processChartData(this.chartData);
      const timeRange = this.dataUpdateService.graphTimeRange;
      this.legends = this.verticalStackOptions.legends ? this.verticalStackOptions.legends : Object.keys(processedData);
      if (!this.isChartOptionsInitialized) {
        this.verticalStackedChartConfig = this.chartService.initChartOption(
          this.theme,
          processedData,
          timeRange,
          'stacked-bar',
          this.verticalStackOptions
        );
        this.chartService.storeTestData(this.inputId, this.chartData);
        if (this.chartData) {
          this.isChartOptionsInitialized = true;
        }
      } else {
        const verticalStackConfigInstance = this.echartsInstance.getModel().option;
        this.verticalStackedChartConfig = this.chartService.updateChartData(
          this.verticalStackedChartConfig,
          processedData,
          timeRange,
          verticalStackConfigInstance,
          this.legends,
          this.theme,
          'stacked-bar',
          dataZoomOption
        );
        if (this.echartsInstance) {
          this.echartsInstance.clear();
          this.echartsInstance.setOption(this.verticalStackedChartConfig);
          this.chartService.storeTestData(this.inputId, this.chartData);
        }
      }
    } catch (err) {
      this.dashBoard.logError(err);
    } finally {
      this.isChartLoading = false;
    }
  }

  onReSize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
      }, this.constants.chartResizeTimeout);
    }
  }

  getVerticalStackedChartData(timeSlot, dateStartTime?, dateEndTime?) {
    let params;
    if (!this.verticalStackOptions.dataEndPoint) {
      return null;
    } else {
      params = {
        timeSlot
      };
      if (this.verticalStackOptions.parameter) {
        params['parameter'] = this.verticalStackOptions.parameter;
      }
      if (dateStartTime && dateEndTime) {
        params['startTime'] = dateStartTime;
        params['endTime'] = dateEndTime;
      }
      if (this.deviceId) {
        params['deviceId'] = this.deviceId;
      }
      return this.dashBoard.getDashBoardData(this.verticalStackOptions.dataEndPoint, params);
    }
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
    this.chartService.listenZoomEvent(this);
  }

  async getZoomData(component, timeSlot, dateStartTime, dateEndTime) {
    this.setTitle(timeSlot);
    const chartData = await component.getVerticalStackedChartData(timeSlot, dateStartTime, dateEndTime);
    const processedData = component.chartService.processChartData(chartData);
    const seriesData = component.chartService.generateSeriesData('stacked-bar', component.legends, processedData, component.theme);
    return { seriesData, chartOption: component.verticalStackedChartConfig };
  }

  changeVerticalStackedChartTheme() {
    this.verticalStackedChartConfig = this.chartService.changeChartTheme(this.verticalStackedChartConfig, this.theme);
    this.echartsInstance.setOption(this.verticalStackedChartConfig);
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
