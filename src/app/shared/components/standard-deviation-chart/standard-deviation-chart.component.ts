import { StandardDeviationChartService } from './../../services/standard-deviation/standard-deviation-chart.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

@Component({
  selector: 'app-deviation-chart',
  templateUrl: './standard-deviation-chart.component.html',
  styleUrls: ['./standard-deviation-chart.component.scss']
})
export class StandardDeviationChartComponent implements OnInit, OnDestroy {
  deviationChartConfig: any;
  @Input() deviationChartOptions: any;
  echartsInstance: any;
  theme: any;
  isChartLoading: boolean;
  isDataEmpty = true;
  deviationChartData: any;
  deviationChartUpdation: Subscription;
  themeSubscription: Subscription;
  constants: any;
  isChartOptionsInitialized = false;
  eChartInitialized = false;
  // Included for selenium testing
  inputId: string;
  last15MinData: any;
  timeSlot: any;
  aggregatesLabel: any;
  highestZoomLevel: number;
  legends: any;
  titleString: any;
  constructor(
    private customTheme: CustomThemeService,
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private deviationChartService: StandardDeviationChartService,
    private config: AppConfigService
  ) {}

  async ngOnInit() {
    this.setTitle();
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.initChartDataUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.deviationChartOptions && this.deviationChartOptions.id) {
      this.inputId = this.deviationChartOptions.id;
    }
  }

  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changeDeviationGraphTheme();
    });
  }
  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.deviationChartOptions, timeInfo);
  }

  initChartDataUpdation() {
    this.deviationChartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
      this.isChartLoading = true;
      try {
        if (!this.constants.refreshEvents.includes(event)) {
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
        this.deviationChartData = await this.getDeviationChartData(requiredTimeRange, startDate, endDate);
        this.legends = this.deviationChartOptions.legends;
        const processedData = this.deviationChartService.processDeviationChartData(this.deviationChartData);
        this.isDataEmpty = this.chartService.isDataSetEmpty(processedData);
        const timeRange = this.dataUpdateService.graphTimeRange;
        if (!this.isChartOptionsInitialized) {
          this.deviationChartConfig = this.deviationChartService.initChartOption(
            this.theme,
            processedData,
            timeRange,
            this.deviationChartOptions
          );
          if (this.deviationChartData) {
            this.isChartOptionsInitialized = true;
          }
          this.chartService.storeTestData(this.inputId, this.deviationChartData);
        } else {
          const deviationChartConfigInstance = this.echartsInstance.getModel().option;
          this.deviationChartConfig = this.deviationChartService.updateChartData(
            this.deviationChartConfig,
            processedData,
            timeRange,
            deviationChartConfigInstance,
            dataZoomOption
          );
          if (this.echartsInstance) {
            this.echartsInstance.clear();
            this.echartsInstance.setOption(this.deviationChartConfig);
            this.chartService.storeTestData(this.inputId, this.deviationChartData);
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

  getDeviationChartData(timeSlot: number, dateStartTime?, dateEndTime?) {
    if (!this.deviationChartOptions.dataEndPoint) {
      return null;
    } else {
      let params = {
        parameter: this.deviationChartOptions.parameter,
        timeSlot
      };
      if (dateStartTime && dateEndTime) {
        params['startTime'] = dateStartTime;
        params['endTime'] = dateEndTime;
      }
      return this.dashBoard.getDashBoardData(this.deviationChartOptions.dataEndPoint, params);
    }
  }

  changeDeviationGraphTheme() {
    this.deviationChartConfig = this.deviationChartService.changeChartTheme(this.deviationChartConfig, this.theme);
    this.echartsInstance.setOption(this.deviationChartConfig);
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
    this.chartService.listenZoomEvent(this);
  }

  async getZoomData(component, timeSlot, dateStartTime, dateEndTime) {
    this.setTitle(timeSlot);
    const deviationChartData = await component.getDeviationChartData(timeSlot, dateStartTime, dateEndTime);
    const processedData = component.deviationChartService.processDeviationChartData(deviationChartData);
    return { seriesData: processedData, chartOption: component.deviationChartConfig };
  }

  saveImage() {
    this.chartService.downloadChart(this.echartsInstance);
  }

  ngOnDestroy() {
    if (this.deviationChartUpdation) {
      this.deviationChartUpdation.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
