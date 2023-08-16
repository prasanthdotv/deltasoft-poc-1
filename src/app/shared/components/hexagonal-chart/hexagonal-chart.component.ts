import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { ChartService } from '@app/shared/services/chart/chart.service';

@Component({
  selector: 'app-hexagonal-chart',
  templateUrl: './hexagonal-chart.component.html',
  styleUrls: ['./hexagonal-chart.component.scss']
})
export class HexagonalChartComponent implements OnInit, OnDestroy {
  @Input() hexChartOptions;
  isChartLoading = true;
  chartData: any;
  chartUpdation: Subscription;
  // Included for selenium testing
  inputId: string;
  last15MinData: any;
  isDataAvailable = false;
  titleString: any;
  constants: any;

  constructor(
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private filterService: FilterService,
    private config: AppConfigService,
    private chartService: ChartService) { }

  async ngOnInit() {
    this.storeChartIDForTesting();
    this.initChartDataUpdation();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.hexChartOptions.id) {
      this.inputId = this.hexChartOptions.id;
    }
  }

  setTitle() {
    this.titleString = this.dataUpdateService.titleCreator(this.hexChartOptions);
  }

  initChartDataUpdation() {
    this.constants = this.config.getConstants();
    this.chartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
      this.isChartLoading = true;
      if (event && !this.constants.refreshEvents.includes(event)) {
        this.setTitle();
      }
      this.chartData = await this.getChartData();
      this.isDataAvailable = this.checkIfDataAvailable(this.chartData);
      this.chartService.storeTestData(this.inputId, this.chartData);
      this.isChartLoading = false;
    });
  }

  checkIfDataAvailable(chartData) {
    let isDataAvailable = false;
    if (chartData) {
      const dataTypes = Object.keys(chartData);
      isDataAvailable = Boolean(chartData[dataTypes[0]] && chartData[dataTypes[0]].length);
    }
    return isDataAvailable;
  }

  getChartData() {
    if (!this.hexChartOptions.dataEndPoint) {
      return null;
    } else {
      const tzOffset = this.dataUpdateService.getTimezoneOffset();
      const filterParams = this.filterService.getAppliedFilters();
      const params = {
        tzOffset,
        ...filterParams
      };
      return this.dashBoard.getDashBoardData(this.hexChartOptions.dataEndPoint, params, this.hexChartOptions.isPostReq);
    }
  }

  originalOrder = (a, b): number => {
    return 0;
  };

  ngOnDestroy() {
    if (this.chartUpdation) {
      this.chartUpdation.unsubscribe();
    }
  }
}
