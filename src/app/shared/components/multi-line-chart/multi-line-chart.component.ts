import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { FilterService } from '@app/shared/services/filter/filter.service';

@Component({
  selector: 'app-multi-line-chart',
  templateUrl: './multi-line-chart.component.html',
  styleUrls: ['./multi-line-chart.component.scss']
})
export class MultiLineChartComponent implements OnInit, OnDestroy {
  multiLineChartConfig: any;
  @Input() multiLineOptions;
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
  titleString: any;
  deviceId: string;

  constructor(
    private customTheme: CustomThemeService,
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private config: AppConfigService,
    private filterService: FilterService
  ) { }

  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.setTitle();
    this.initChartUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.multiLineOptions.id) {
      this.inputId = this.multiLineOptions.id;
    }
  }
  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.multiLineOptions, timeInfo);
  }
  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changeMultiLineGraphTheme();
    });
  }

  initChartUpdation() {
    if (this.multiLineOptions.deviceDependentRefresh) {
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
      if (this.multiLineOptions.customZoomDisabled) {
        args = await this.defaultArgs(event);
      } else {
        args = await this.argsWithCustomZoomOption(event);
      }
      this.legends = this.multiLineOptions.legends ? this.multiLineOptions.legends : Object.keys(args.processedData);
      if (!this.isChartOptionsInitialized) {
        this.multiLineChartConfig = this.chartService.initChartOption(
          this.theme,
          args.processedData,
          args.timeRange,
          'multi-line',
          this.multiLineOptions
        );
        this.chartService.storeTestData(this.inputId, this.chartData);
        if (this.chartData) {
          this.isChartOptionsInitialized = true;
        }
      } else {
        const multiLineChartConfigInstance = this.echartsInstance.getModel().option;
        this.multiLineChartConfig = this.chartService.updateChartData(
          this.multiLineChartConfig,
          args.processedData,
          args.timeRange,
          multiLineChartConfigInstance,
          this.legends,
          this.theme,
          'multi-line',
          args.dataZoomOption
        );
        if (this.echartsInstance) {
          this.echartsInstance.clear();
          this.echartsInstance.setOption(this.multiLineChartConfig);
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
    this.chartData = await this.getMultiLineChartData(this.timeSlot);
    const processedData = this.chartService.processChartData(this.chartData, true);
    const timeRange = this.multiLineOptions.deviceDependentRefresh
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
      this.chartData = await this.getMultiLineChartData(timeSlot, dateStartTime, dateEndTime);
    } else {
      this.highestZoomLevel = this.chartService.getZoomLevel(this.timeSlot);
      const { dataZoomOption, requiredTimeRange, startDate, endDate } = this.chartService.getZoomDataOptions(
        event,
        this.echartsInstance,
        this.timeSlot,
        this.highestZoomLevel
      );
      dataZoomConfig = dataZoomOption;
      this.chartData = await this.getMultiLineChartData(requiredTimeRange, startDate, endDate);
    }

    if (this.multiLineOptions.isMetricWiseChart) {
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

  getMultiLineChartData(timeSlot, dateStartTime?, dateEndTime?) {
    let params;
    if (!this.multiLineOptions.dataEndPoint) {
      return null;
    } else {
      const filterParams = this.filterService.getAppliedFilters();
      params = {
        parameter: this.multiLineOptions.parameter,
        timeSlot,
        ...filterParams
      };
      if (dateStartTime && dateEndTime) {
        params['startTime'] = dateStartTime;
        params['endTime'] = dateEndTime;
      }
      if (this.deviceId) {
        params['deviceId'] = this.deviceId;
      }
      return this.dashBoard.getDashBoardData(this.multiLineOptions.dataEndPoint, params, this.multiLineOptions.isPostReq);
    }
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
    if (!this.multiLineOptions.customZoomDisabled) {
      this.chartService.listenZoomEvent(this);
    }
  }

  async getZoomData(component, timeSlot, dateStartTime, dateEndTime) {
    const timeInfo = {
      timeSlot,
      dateStartTime,
      dateEndTime
    };
    this.setTitle(timeInfo);
    const { processedData } = await this.argsWithCustomZoomOption('zoom', timeSlot, dateStartTime, dateEndTime);
    const seriesData = component.chartService.generateSeriesData('multi-line', component.legends, processedData, component.theme);
    return {
      seriesData,
      chartOption: component.multiLineChartConfig,
      legends: this.legends
    };
  }

  changeMultiLineGraphTheme() {
    this.multiLineChartConfig = this.chartService.changeChartTheme(this.multiLineChartConfig, this.theme);
    this.echartsInstance.setOption(this.multiLineChartConfig);
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
