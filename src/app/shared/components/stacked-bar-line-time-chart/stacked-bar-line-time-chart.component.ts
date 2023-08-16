import { StackedBarLineChartService } from '../../services/stacked-bar-line-time-chart/stacked-bar-line-time-chart.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { FilterService } from '@app/shared/services/filter/filter.service';

@Component({
  selector: 'app-stacked-bar-line-time-chart',
  templateUrl: './stacked-bar-line-time-chart.component.html',
  styleUrls: ['./stacked-bar-line-time-chart.component.scss']
})
export class StackedBarLineChartComponent implements OnInit, OnDestroy {
  stackedBarLineChartConfig: any;
  @Input() stackedBarLineChartOptions: any;
  echartsInstance: any;
  theme: any;
  isChartLoading: boolean;
  isDataEmpty = true;
  stackedBarLineChartData: any;
  processedData: any;
  stackedBarLineChartUpdation: Subscription;
  themeSubscription: Subscription;
  constants: any;
  isChartOptionsInitialized = false;
  eChartInitialized = false;
  // Included for selenium testing
  inputId: string;
  last15MinData: any;
  legends: any;
  timeSlot: any;
  highestZoomLevel: number;
  selectedGraphType: string;
  titleString: any;

  constructor(
    private customTheme: CustomThemeService,
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private stackedBarLineChartService: StackedBarLineChartService,
    private config: AppConfigService,
    private filterService: FilterService
  ) { }

  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.setTitle();
    this.initChartDataUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.stackedBarLineChartOptions && this.stackedBarLineChartOptions.id) {
      this.inputId = this.stackedBarLineChartOptions.id;
    }
  }
  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.stackedBarLineChartOptions, timeInfo);
  }
  initChartDataUpdation() {
    this.selectedGraphType = this.stackedBarLineChartOptions.defaultGraphType;
    this.stackedBarLineChartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
      this.isChartLoading = true;
      try {
        if (event && !this.constants.refreshEvents.includes(event)) {
          this.setTitle();
        }
        this.timeSlot = this.dataUpdateService.selectedDateRange
          ? this.dataUpdateService.selectedDateRange
          : this.dataUpdateService.selectedTimeRange;
        this.highestZoomLevel = this.chartService.getZoomLevel(this.timeSlot);
        const { requiredTimeRange, startDate, endDate } = this.chartService.getZoomDataOptions(
          event,
          this.echartsInstance,
          this.timeSlot,
          this.highestZoomLevel
        );
        this.stackedBarLineChartData = await this.getStackedBarLineChartData(requiredTimeRange, startDate, endDate);
        this.processedData = this.chartService.processChartData(this.stackedBarLineChartData);
        this.isDataEmpty = this.chartService.isDataSetEmpty(this.processedData);
        const timeRange = this.dataUpdateService.graphTimeRange;
        this.legends = this.stackedBarLineChartOptions.legends ? this.stackedBarLineChartOptions.legends : Object.keys(this.processedData);
        if (!this.isChartOptionsInitialized) {
          this.stackedBarLineChartConfig = this.stackedBarLineChartService.initChartOption(
            this.theme,
            this.processedData,
            timeRange,
            this.stackedBarLineChartOptions,
            this.selectedGraphType
          );
          if (this.stackedBarLineChartData) {
            this.isChartOptionsInitialized = true;
          }
          this.chartService.storeTestData(this.inputId, this.stackedBarLineChartData);
        } else {
          this.graphUpdate(this.selectedGraphType, event);
        }
      } catch (err) {
        this.dashBoard.logError(err);
      } finally {
        this.isChartLoading = false;
      }
    });
  }

  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changeStackedBarLineGraphTheme();
    });
  }

  onReSize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
      }, this.constants.chartResizeTimeout);
    }
  }

  getStackedBarLineChartData(timeSlot: number, dateStartTime?, dateEndTime?) {
    if (!this.stackedBarLineChartOptions.dataEndPoint) {
      return null;
    } else {
      const filterParams = this.filterService.getAppliedFilters();
      let params = {
        parameter: this.stackedBarLineChartOptions.parameter,
        timeSlot,
        ...filterParams
      };
      if (dateStartTime && dateEndTime) {
        params['startTime'] = dateStartTime;
        params['endTime'] = dateEndTime;
      }
      return this.dashBoard.getDashBoardData(this.stackedBarLineChartOptions.dataEndPoint, params, this.stackedBarLineChartOptions.isPostReq);
    }
  }

  changeStackedBarLineGraphTheme() {
    this.stackedBarLineChartConfig = this.stackedBarLineChartService.changeChartTheme(this.stackedBarLineChartConfig, this.theme);
    this.echartsInstance.setOption(this.stackedBarLineChartConfig);
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
    this.chartService.listenZoomEvent(this);
  }

  async getZoomData(component, timeSlot, dateStartTime, dateEndTime) {
    const timeInfo = {
      timeSlot,
      dateStartTime,
      dateEndTime
    };
    this.setTitle(timeInfo);
    const stackedBarLineChartData = await component.getStackedBarLineChartData(timeSlot, dateStartTime, dateEndTime);
    this.processedData = this.chartService.processChartData(stackedBarLineChartData);
    const seriesData = component.stackedBarLineChartService.generateSeriesData(
      component.legends,
      this.processedData,
      component.theme,
      component.selectedGraphType
    );
    return { seriesData, chartOption: component.stackedBarLineChartConfig };
  }

  graphUpdate(type, event?) {
    this.selectedGraphType = type;
    const { dataZoomOption } = this.chartService.getZoomDataOptions(event, this.echartsInstance, this.timeSlot, this.highestZoomLevel);
    const timeRange = this.dataUpdateService.graphTimeRange;
    const stackedBarLineChartConfigInstance = this.echartsInstance.getModel().option;
    this.stackedBarLineChartConfig = this.stackedBarLineChartService.updateChartData(
      this.stackedBarLineChartConfig,
      this.processedData,
      timeRange,
      this.theme,
      this.legends,
      stackedBarLineChartConfigInstance,
      dataZoomOption,
      type
    );
    this.echartsInstance.clear();
    this.echartsInstance.setOption(this.stackedBarLineChartConfig);
    this.chartService.storeTestData(this.inputId, this.stackedBarLineChartData);
  }

  saveImage() {
    this.chartService.downloadChart(this.echartsInstance);
  }

  ngOnDestroy() {
    if (this.stackedBarLineChartUpdation) {
      this.stackedBarLineChartUpdation.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
