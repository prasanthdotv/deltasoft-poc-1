import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { GaugeService } from '@app/shared/services/gauge/gauge.service';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss']
})
export class GaugeComponent implements OnInit, OnDestroy {
  barChartConfig: any;
  @Input() barChartOptions: any;
  echartsInstance: any;
  theme: any;
  isChartLoading: boolean;
  barChartData: any;
  barChartUpdation: Subscription;
  pageUpdation: Subscription;
  themeSubscription: Subscription;
  constants: any;
  isChartOptionsInitialized = false;
  eChartInitialized = false;
  // Included for selenium testing
  inputId: string;
  last15MinData: any;
  timeSlot: any;
  highestZoomLevel: number;
  barType: any;
  legends: any;
  deviceId: string;
  titleString: any;

  constructor(
    private customTheme: CustomThemeService,
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private barChartService: GaugeService,
    private config: AppConfigService,
    private filterService: FilterService
  ) {}

  async ngOnInit() {
    // this.storeChartIDForTesting();
    this.initThemeOptions();
    this.setTitle();
    this.initChartUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.barChartOptions && this.barChartOptions.id) {
      this.inputId = this.barChartOptions.id;
    }
  }

  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.barChartOptions, timeInfo);
  }

  initChartUpdation() {
    if (this.barChartOptions.deviceDependentRefresh) {
      this.barChartUpdation = this.dataUpdateService.updateDeviceData$.subscribe(async event => {
        if (event) {
          this.deviceId = event.id;
          this.initChartDataUpdation(event.type);
        }
      });
    } else {
      this.barChartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
        this.deviceId = null;
        this.initChartDataUpdation(event);
      });
    }
  }

  async initChartDataUpdation(event?) {
    if (event && !this.constants.refreshEvents.includes(event)) {
      this.setTitle();
    }
    this.isChartLoading = true;
    try {
      this.timeSlot = this.dataUpdateService.selectedDateRange
        ? this.dataUpdateService.selectedDateRange
        : this.dataUpdateService.selectedTimeRange;
      this.barChartData = await this.getBarChartData();
      // const processedData = this.barChartService.processChartData(this.barChartData);
      const processedData = this.barChartService.processChartData(this.barChartData);
      if (!this.isChartOptionsInitialized) {
        this.barChartConfig = this.barChartService.initChartOption(this.theme, processedData, this.barChartOptions);
        if (this.barChartData) {
          this.isChartOptionsInitialized = true;
        }
        this.chartService.storeTestData(this.inputId, this.barChartData);
      } else {
        this.barChartConfig = this.barChartService.updateChartData(this.barChartConfig, processedData);
        if (this.echartsInstance) {
          this.echartsInstance.setOption(this.barChartConfig);
          this.chartService.storeTestData(this.inputId, this.barChartData);
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

  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changeBarGraphTheme();
    });
  }

  getBarChartData() {
    // if (!this.barChartOptions.dataEndPoint) {
    //   return null;
    // } else {
    //   const filterParams = this.filterService.getAppliedFilters();
    //   let params = {
    //     ...filterParams
    //   };
    //   if (this.barChartOptions.parameter) {
    //     params['parameter'] = this.barChartOptions.parameter;
    //   }
    //   if (this.deviceId) {
    //     params['deviceId'] = this.deviceId;
    //   }
    //   return this.dashBoard.getDashBoardData(this.barChartOptions.dataEndPoint, params, this.barChartOptions.isPostReq);
    // }
    return {};
  }

  changeBarGraphTheme() {
    this.barChartConfig = this.barChartService.changeChartTheme(this.barChartConfig, this.theme);
    this.echartsInstance.setOption(this.barChartConfig);
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  saveImage() {
    this.chartService.downloadChart(this.echartsInstance);
  }

  ngOnDestroy() {
    if (this.barChartUpdation) {
      this.barChartUpdation.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
