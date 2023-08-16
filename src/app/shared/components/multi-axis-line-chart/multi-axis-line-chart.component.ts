import { MultiAxisLineChartService } from './../../services/multi-axis-line-chart/multi-axis-line-chart.service';
import { Component, Input, OnInit } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multi-axis-line-chart',
  templateUrl: './multi-axis-line-chart.component.html',
  styleUrls: ['./multi-axis-line-chart.component.scss']
})
export class MultiAxisLineChartComponent implements OnInit {
  multiAxisLineChartConfig: any;
  @Input() multiAxisLineOptions;
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
  titleString: any;

  constructor(
    private customTheme: CustomThemeService,
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private multiAxisLineChartService: MultiAxisLineChartService,
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
    if (this.multiAxisLineOptions.id) {
      this.inputId = this.multiAxisLineOptions.id;
    }
  }
  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.multiAxisLineOptions, timeInfo);
  }
  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changeMultiAxisLineGraphTheme();
    });
  }

  initChartUpdation() {
    if (this.multiAxisLineOptions.deviceDependentRefresh) {
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
      let args: any = {};
      if (event && !this.constants.refreshEvents.includes(event)) {
        this.setTitle();
      }
      this.timeSlot = this.dataUpdateService.selectedDateRange
        ? this.dataUpdateService.selectedDateRange
        : this.dataUpdateService.selectedTimeRange;
      if (this.multiAxisLineOptions.customZoomDisabled) {
        args = await this.defaultArgs(event);
      } else {
        args = await this.argsWithCustomZoomOption(event);
      }
      this.legends = this.multiAxisLineOptions.legends ? this.multiAxisLineOptions.legends : Object.keys(args.processedData);
      if (!this.isChartOptionsInitialized) {
        this.multiAxisLineChartConfig = this.multiAxisLineChartService.initChartOption(
          this.theme,
          args.processedData,
          args.timeRange,
          this.multiAxisLineOptions
        );
        this.chartService.storeTestData(this.inputId, this.chartData);
        if (this.chartData) {
          this.isChartOptionsInitialized = true;
        }
      } else {
        const multiAxisLineChartConfigInstance = this.echartsInstance.getModel().option;
        this.multiAxisLineChartConfig = this.multiAxisLineChartService.updateChartData(
          this.multiAxisLineChartConfig,
          args.processedData,
          args.timeRange,
          this.theme,
          this.legends,
          multiAxisLineChartConfigInstance,
          args.dataZoomOption
        );
        if (this.echartsInstance) {
          this.echartsInstance.clear();
          this.echartsInstance.setOption(this.multiAxisLineChartConfig);
          this.chartService.storeTestData(this.inputId, this.chartData);
        }
      }
    } catch (err) {
      this.dashBoard.logError(err);
    } finally {
      this.isChartLoading = false;
    }
  }

  async defaultArgs(event) {
    let dataZoomOption = {};
    this.chartData = await this.getMultiAxisLineChartData(this.timeSlot);
    const processedData = this.chartService.processChartData(this.chartData, true);
    const timeRange = this.multiAxisLineOptions.deviceDependentRefresh
      ? this.dataUpdateService.graphTimeRangeWithTmZn
      : this.dataUpdateService.graphTimeRange;
    if (event && this.constants.refreshEvents.includes(event) && this.echartsInstance) {
      dataZoomOption = this.echartsInstance.getModel().option.dataZoom[0];
    } else {
      dataZoomOption = {
        start: 0,
        end: 100
      };
    }
    return { processedData, timeRange, dataZoomOption };
  }

  async argsWithCustomZoomOption(event, timeSlot?, dateStartTime?, dateEndTime?) {
    let processedData;
    let dataZoomConfig;
    if (timeSlot && dateStartTime && dateEndTime) {
      this.chartData = await this.getMultiAxisLineChartData(timeSlot, dateStartTime, dateEndTime);
    } else {
      this.highestZoomLevel = this.chartService.getZoomLevel(this.timeSlot);
      const { dataZoomOption, requiredTimeRange, startDate, endDate } = this.chartService.getZoomDataOptions(
        event,
        this.echartsInstance,
        this.timeSlot,
        this.highestZoomLevel
      );
      dataZoomConfig = dataZoomOption;
      this.chartData = await this.getMultiAxisLineChartData(requiredTimeRange, startDate, endDate);
    }

    if (this.multiAxisLineOptions.isMetricWiseChart) {
      processedData = this.chartService.processMetricChartData(this.chartData);
    } else {
      processedData = this.chartService.processChartData(this.chartData);
    }
    const timeRange = this.dataUpdateService.graphTimeRange;
    return { processedData, timeRange, dataZoomOption: dataZoomConfig };
  }

  onReSize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
      }, this.constants.chartResizeTimeout);
    }
  }

  getMultiAxisLineChartData(timeSlot, dateStartTime?, dateEndTime?) {
    let params;
    if (!this.multiAxisLineOptions.dataEndPoint) {
      return null;
    } else {
      params = {
        parameter: this.multiAxisLineOptions.parameter,
        timeSlot
      };
      if (dateStartTime && dateEndTime) {
        params['startTime'] = dateStartTime;
        params['endTime'] = dateEndTime;
      }
      if (this.deviceId) {
        params['deviceId'] = this.deviceId;
      }

      return this.dashBoard.getDashBoardData(this.multiAxisLineOptions.dataEndPoint, params, this.multiAxisLineOptions.isPostReq);
    }
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
    if (!this.multiAxisLineOptions.customZoomDisabled) {
      this.chartService.listenZoomEvent(this);
    }
  }

  async getZoomData(component, timeSlot, dateStartTime, dateEndTime) {
    this.setTitle(timeSlot);
    const { processedData } = await this.argsWithCustomZoomOption('zoom', timeSlot, dateStartTime, dateEndTime);
    const seriesData = component.multiAxisLineChartService.generateSeriesData(component.legends, processedData, component.theme);
    return { seriesData, chartOption: component.multiAxisLineChartConfig };
  }

  changeMultiAxisLineGraphTheme() {
    this.multiAxisLineChartConfig = this.multiAxisLineChartService.changeChartTheme(this.multiAxisLineChartConfig, this.theme);
    this.echartsInstance.setOption(this.multiAxisLineChartConfig);
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
