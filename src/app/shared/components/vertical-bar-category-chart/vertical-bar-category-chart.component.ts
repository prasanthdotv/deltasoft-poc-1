import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { VerticalBarChartService } from '@app/shared/services/vertical-bar-category-chart/vertical-bar-category-chart.service';

@Component({
  selector: 'app-vertical-bar-category-chart',
  templateUrl: './vertical-bar-category-chart.component.html',
  styleUrls: ['./vertical-bar-category-chart.component.scss']
})
export class VerticalBarChartComponent implements OnInit, OnDestroy {
  verticalBarChartConfig: any;
  @Input() verticalBarChartOptions;
  echartsInstance: any;
  theme: any;
  isChartLoading: boolean;
  isDataEmpty = true;
  verticalBarChartData: any;
  processedData: any;
  verticalBarChartUpdation: Subscription;
  themeSubscription: Subscription;
  constants: any;
  isChartOptionsInitialized = false;
  eChartInitialized = false;
  // Included for selenium testing
  inputId: string;
  last15MinData: any;
  titleString: any;

  constructor(
    private customTheme: CustomThemeService,
    private dashBoardService: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private chartService: ChartService,
    private config: AppConfigService,
    private filterService: FilterService,
    private verticalBarChartService: VerticalBarChartService
  ) { }

  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.setTitle();
    this.initChartDataUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.verticalBarChartOptions && this.verticalBarChartOptions.id) {
      this.inputId = this.verticalBarChartOptions.id;
    }
  }

  setTitle() {
    const { appsDurationRange } = this.constants;
    let titleValue = this.filterService.getSpecificFilter('duration');
    this.titleString = titleValue ? appsDurationRange.filter(title => title.value === titleValue)[0].label : '';
  }

  initChartDataUpdation() {
    this.verticalBarChartUpdation = this.dataUpdateService.updateReportData$.subscribe(async () => {
      this.isChartLoading = true;
      try {
        if (event && !this.constants.refreshEvents.includes(event)) {
          this.setTitle();
        }
        this.verticalBarChartData = await this.getVerticalBarChartData();
        this.processedData = this.verticalBarChartService.processVerticalBarChartData(this.verticalBarChartData);
        this.isDataEmpty = this.chartService.isDataSetEmpty(this.processedData);
        if (!this.isChartOptionsInitialized) {
          this.verticalBarChartConfig = this.verticalBarChartService.initVerticalBarChartOption(
            this.theme,
            this.processedData
          );
          if (this.verticalBarChartData) {
            this.isChartOptionsInitialized = true;
          }
          this.chartService.storeTestData(this.inputId, this.verticalBarChartData);
        } else {
          this.graphUpdate(event);
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
      this.changeVerticalBarChartTheme();
    });
  }

  onReSize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
      }, this.constants.chartResizeTimeout);
    }
  }

  getVerticalBarChartData() {
    if (!this.verticalBarChartOptions.dataEndPoint) {
      return null;
    } else {
      const filterParams = this.filterService.getAppliedFilters();
      let params = {
        ...filterParams
      };
      return this.dashBoardService.getDashBoardData(this.verticalBarChartOptions.dataEndPoint, params, this.verticalBarChartOptions.isPostReq);
    }
  }

  changeVerticalBarChartTheme() {
    this.verticalBarChartConfig = this.verticalBarChartService.changeChartTheme(this.verticalBarChartConfig, this.theme);
    this.echartsInstance.setOption(this.verticalBarChartConfig);
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  graphUpdate(event?) {
    this.verticalBarChartConfig = this.verticalBarChartService.updateVerticalBarChartOption(
      this.verticalBarChartConfig,
      this.processedData
    );
    this.echartsInstance.clear();
    this.echartsInstance.setOption(this.verticalBarChartConfig);
    this.chartService.storeTestData(this.inputId, this.verticalBarChartData);
  }

  downloadCsv() {
    this.chartService.downloadCsv(this.verticalBarChartOptions.csvEndpoint);
  }

  saveImage() {
    this.chartService.downloadChart(this.echartsInstance);
  }

  ngOnDestroy() {
    if (this.verticalBarChartUpdation) {
      this.verticalBarChartUpdation.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
