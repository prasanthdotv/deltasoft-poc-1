import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { BarLineChartService } from '@app/shared/services/bar-line-category-chart/bar-line-category-chart.service';

@Component({
  selector: 'app-bar-line-category-chart',
  templateUrl: './bar-line-category-chart.component.html',
  styleUrls: ['./bar-line-category-chart.component.scss']
})
export class BarLineChartComponent implements OnInit, OnDestroy {
  barLineChartConfig: any;
  @Input() barLineChartOptions: any;
  echartsInstance: any;
  theme: any;
  isChartLoading: boolean;
  isDataEmpty = true;
  barLineChartData: any;
  processedData: any;
  barLineChartUpdation: Subscription;
  themeSubscription: Subscription;
  constants: any;
  isChartOptionsInitialized = false;
  eChartInitialized = false;
  // Included for selenium testing
  inputId: string;
  last15MinData: any;
  legends: any;
  selectedGraphType: string;
  titleString: any;

  constructor(
    private customTheme: CustomThemeService,
    private dashBoardService: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private config: AppConfigService,
    private filterService: FilterService,
    private barLineChartService: BarLineChartService
  ) { }

  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.setTitle();
    this.initChartDataUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.barLineChartOptions && this.barLineChartOptions.id) {
      this.inputId = this.barLineChartOptions.id;
    }
  }

  setTitle() {
    const { appsDurationRange } = this.constants;
    let titleValue = this.filterService.getSpecificFilter('duration');
    this.titleString = titleValue ? appsDurationRange.filter(title => title.value === titleValue)[0].label : '';
  }

  initChartDataUpdation() {
    this.selectedGraphType = this.barLineChartOptions.defaultGraphType;
    this.barLineChartUpdation = this.dataUpdateService.updateReportData$.subscribe(async event => {
      this.isChartLoading = true;
      try {
        if (event && !this.constants.refreshEvents.includes(event)) {
          this.setTitle();
        }
        this.barLineChartData = await this.getBarLineChartData();
        this.processedData = this.barLineChartService.processBarLineChartData(this.barLineChartData);
        this.isDataEmpty = this.chartService.isDataSetEmpty(this.processedData);
        this.legends = this.barLineChartOptions.legends ? this.barLineChartOptions.legends : Object.keys(this.processedData);
        if (!this.isChartOptionsInitialized) {
          this.barLineChartConfig = this.barLineChartService.initChartOption(
            this.theme,
            this.processedData,
            this.barLineChartOptions,
            this.selectedGraphType
          );
          if (this.barLineChartData) {
            this.isChartOptionsInitialized = true;
          }
          this.chartService.storeTestData(this.inputId, this.barLineChartData);
        } else {
          this.graphUpdate(this.selectedGraphType, event);
        }
      } catch (err) {
        this.dashBoardService.logError(err);
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
      this.changeBarLineGraphTheme();
    });
  }

  onReSize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
      }, this.constants.chartResizeTimeout);
    }
  }

  getBarLineChartData() {
    if (!this.barLineChartOptions.dataEndPoint) {
      return null;
    } else {
      const filterParams = this.filterService.getAppliedFilters();
      let params = {
        ...filterParams
      };
      return this.dashBoardService.getDashBoardData(this.barLineChartOptions.dataEndPoint, params, this.barLineChartOptions.isPostReq);
    }
  }

  changeBarLineGraphTheme() {
    this.barLineChartConfig = this.barLineChartService.changeChartTheme(this.barLineChartConfig, this.theme);
    this.echartsInstance.setOption(this.barLineChartConfig);
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  graphUpdate(type, event?) {
    this.selectedGraphType = type;
    const barLineChartConfigInstance = this.echartsInstance.getModel().option;
    this.barLineChartConfig = this.barLineChartService.updateChartData(
      this.barLineChartConfig,
      this.processedData,
      this.theme,
      this.legends,
      barLineChartConfigInstance,
      type
    );
    this.echartsInstance.clear();
    this.echartsInstance.setOption(this.barLineChartConfig);
    this.chartService.storeTestData(this.inputId, this.barLineChartData);
  }

  downloadCsv() {
    this.chartService.downloadCsv(this.barLineChartOptions.csvEndpoint);
  }

  saveImage() {
    this.chartService.downloadChart(this.echartsInstance);
  }

  ngOnDestroy() {
    if (this.barLineChartUpdation) {
      this.barLineChartUpdation.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
