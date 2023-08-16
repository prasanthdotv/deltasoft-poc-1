import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { PieChartService } from '@app/shared/services/pie-chart/pie-chart.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { ToastrService } from 'ngx-toastr';
import * as FileSaver from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit, OnDestroy {
  @Input() pieChartOptions: any;
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
  pieData: any;
  // Included for selenium testing
  inputId: string;
  lastData: any;
  titleString: any;
  isDataEmpty = true;

  constructor(
    private customTheme: CustomThemeService,
    private chartService: ChartService,
    private dashboardService: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private pieChartService: PieChartService,
    private config: AppConfigService,
    private filterService: FilterService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initThemeOptions();
    this.setTitle();
    this.initChartDataUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.pieChartOptions && this.pieChartOptions.id) {
      this.inputId = this.pieChartOptions.id;
    }
  }

  initThemeOptions() {
    this.constants = this.config.getConstants();
    this.theme = this.chartService.initThemeOptions();
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? this.customTheme.ICXDarkThemeValues : this.customTheme.ICXLightThemeValues;
      this.changePieChartTheme();
    });
  }
  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.pieChartOptions, timeInfo);
  }
  initChartDataUpdation() {
    this.pieData = {
      exportParameter: this.pieChartOptions.exportParameter,
      interval: this.pieChartOptions.interval,
      needExport: this.pieChartOptions.needExport,
      status: this.pieChartOptions.status
    };
    this.chartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
      this.isChartLoading = true;
      if (event && !this.constants.refreshEvents.includes(event)) {
        this.setTitle();
      }
      this.chartData = await this.getPieChartData();
      const processedData = this.pieChartService.processPieChartData(this.chartData);
      this.isDataEmpty = this.chartService.isDataSetEmpty(processedData);
      if (!this.isChartOptionsInitialized) {
        this.chartOption = this.pieChartService.initPieChartOption(this.theme, processedData);
        if (this.chartData) {
          this.isChartOptionsInitialized = true;
        }
        this.chartService.storeTestData(this.inputId, this.chartData);
      } else {
        const chartOptionInstance = this.echartsInstance.getModel().option;
        this.chartOption = this.pieChartService.updatePieChartOption(this.chartOption, processedData, this.theme, chartOptionInstance);
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

  getPieChartData(timeSlot?, dateStartTime?, dateEndTime?) {
    if (!this.pieChartOptions.dataEndPoint) {
      return null;
    } else {
      const filterParams = this.filterService.getAppliedFilters();
      this.options = {
        ...filterParams
      };
      if (dateStartTime && dateEndTime) {
        this.options['startTime'] = dateStartTime;
        this.options['endTime'] = dateEndTime;
      }
      if (this.pieChartOptions.parameter) {
        this.options.parameter = this.pieChartOptions.parameter;
      }
      return this.dashboardService.getDashBoardData(this.pieChartOptions.dataEndPoint, this.options, this.pieChartOptions.isPostReq);
    }
  }

  changePieChartTheme() {
    this.chartOption = this.pieChartService.changePieChartTheme(this.chartOption, this.theme);
    if (this.echartsInstance) {
      this.echartsInstance.setOption(this.chartOption);
    }
  }

  saveImage() {
    this.chartService.downloadChart(this.echartsInstance);
  }

  async downloadCsv() {
    this.spinner.show();
    try {
      if (this.pieChartOptions.csvEndPoint) {
        const tzOffset = this.dataUpdateService.getTimezoneOffset();
        const csvResponse: any = await this.dashboardService.downloadCsvData(
          { ...this.options, tzOffset },
          this.pieChartOptions.csvEndPoint
        );
        const blob = new Blob([csvResponse.data], { type: 'text/csv' });
        const csvName = this.pieChartOptions.csvName ? this.pieChartOptions.csvName : 'csvData';
        FileSaver.saveAs(blob, `${csvName}.csv`);
      }
    } catch (error) {
      this.toastr.error('Something went wrong', 'Error');
    } finally {
      this.spinner.hide();
    }
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
