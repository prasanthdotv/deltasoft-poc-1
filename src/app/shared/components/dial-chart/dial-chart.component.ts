import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { DialChartService } from '@app/shared/services/dial-chart/dial-chart.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

@Component({
  selector: 'app-dial-chart',
  templateUrl: './dial-chart.component.html',
  styleUrls: ['./dial-chart.component.scss']
})
export class DialChartComponent implements OnInit, OnDestroy {
  @Input() dialChartOptions;
  chartOption: any;
  isChartLoading: boolean;
  isChartOptionsInitialized = false;
  echartsInstance: any;
  constants: any;
  theme: any;
  options: any;
  chartData: any;
  chartUpdation: Subscription;
  themeSubscription: Subscription;
  // Included for selenium testing
  inputId: string;
  lastData: any;
  titleString: any;

  constructor(
    private customTheme: CustomThemeService,
    private chartService: ChartService,
    private dashBoard: DashBoardService,
    private toastr: ToastrService,
    private dataUpdateService: DataUpdateService,
    private filterService: FilterService,
    private dialChartService: DialChartService,
    private config: AppConfigService
  ) { }

  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.setTitle();
    this.initChartDataUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.dialChartOptions && this.dialChartOptions.id) {
      this.inputId = this.dialChartOptions.id;
    }
  }

  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changeDialChartTheme();
    });
  }

  setTitle() {
    this.titleString = this.dataUpdateService.titleCreator(this.dialChartOptions);
  }

  initChartDataUpdation() {
    this.chartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
      this.isChartLoading = true;
      const unit = this.dialChartOptions.unit;
      if (event && !this.constants.refreshEvents.includes(event)) {
        this.setTitle();
      }
      this.chartData = await this.getDialChartData();
      const processedData = this.dialChartService.processDialChartData(this.chartData);
      if (!this.isChartOptionsInitialized) {
        this.chartOption = this.dialChartService.initDialChartOption(this.theme, processedData, unit);
        if (this.chartData) {
          this.isChartOptionsInitialized = true;
        }
        this.chartService.storeTestData(this.inputId, this.chartData);
      } else {
        this.chartOption = this.dialChartService.updateDialChartOption(this.chartOption, this.theme, processedData, unit);
        if (this.echartsInstance) {
          this.echartsInstance.setOption(this.chartOption);
          this.chartService.storeTestData(this.inputId, this.chartData);
        }
      }
      this.isChartLoading = false;
    });
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  onReSize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
      }, this.constants.chartResizeTimeout);
    }
  }

  getDialChartData() {
    if (!this.dialChartOptions.dataEndPoint) {
      return null;
    } else {
      const filterParams = this.filterService.getAppliedFilters();
      this.options = {
        parameter: this.dialChartOptions.parameter,
        ...filterParams
      };
      return this.dashBoard.getDashBoardData(this.dialChartOptions.dataEndPoint, this.options, this.dialChartOptions.isPostReq);
    }
  }

  changeDialChartTheme() {
    this.chartOption = this.dialChartService.changeDialChartTheme(this.chartOption, this.theme);
    if (this.echartsInstance) {
      this.echartsInstance.setOption(this.chartOption);
    }
  }

  showError(err) {
    this.toastr.error('Something went wrong', 'Error');
  }

  saveImage() {
    this.chartService.downloadChart(this.echartsInstance);
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.chartUpdation) {
      this.chartUpdation.unsubscribe();
    }
  }
}
