import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { ChartService } from '@app/shared/services/chart/chart.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-param-overview',
  templateUrl: './param-overview.component.html',
  styleUrls: ['./param-overview.component.scss']
})
export class ParamOverviewComponent implements OnInit, OnDestroy {

  @Input() paramOptions: any;
  paramList = [];
  dataUpdation: Subscription;
  loading = true;
  timeRange: any;
  allowedParams: any;
  // Included for selenium testing
  inputId: any;
  constructor(
    private dataUpdateService: DataUpdateService,
    private dashBoard: DashBoardService,
    private filterService: FilterService,
    private router: Router,
    private dialogService: NbDialogService,
    private chartService: ChartService
  ) { }

  ngOnInit() {
    this.allowedParams = this.paramOptions.paramList;
    this.initDataUpdation();
    this.storeChartIDForTesting();
  }

  // Included for selenium testing
  storeChartIDForTesting() {
    if (this.paramOptions && this.paramOptions.id) {
      this.inputId = this.paramOptions.id;
    }
  }

  initDataUpdation() {
    this.dataUpdation = this.dataUpdateService.updateLiveData$.subscribe(
      async () => {
        try {
          this.loading = true;
          await this.processData();
          this.loading = false;
        } catch (err) {
          this.paramList = [];
          this.dashBoard.logError(err);
        } finally {
          this.loading = false;
        }
      }
    );
  }

  async processData() {
    this.timeRange = {};
    const paramData = await this.getParamData();
    if (paramData && paramData.data) {
      const { data } = paramData;
      const params = Object.keys(data);
      if (params && params.length) {
        this.paramList = [];
        params.forEach(param => {
          if (this.allowedParams[param]) {
            const paramInfo = _.clone(this.allowedParams[param]);
            this.paramList.push({ ...paramInfo, label: Number(data[param]) });
          }
        })
      }
      this.timeRange = { dateFrom: paramData.dateFrom, dateUpto: paramData.dateUpto }
    }
    this.chartService.storeTestData(this.inputId, this.paramList);
  }

  reDirectToDashboard(url) {
    this.router.navigate(['pages', url]);
  }

  getParamData() {
    const filterParams = this.filterService.getAppliedFilters();
    const parameters = Object.keys(this.allowedParams);
    let params = {
      ...filterParams,
      parameters: parameters
    };
    return this.dashBoard.getDashBoardData(
      this.paramOptions.dataEndPoint,
      params,
      this.paramOptions.isPostReq
    );
  }

  openDrillDown(parameter, label) {
    if (label) {
      const drilldownInfo = {
        parameter: parameter,
        status: this.paramOptions.boxType,
        ...this.timeRange
      }
      this.dialogService.open(PopUpComponent, {
        context: {
          boxData: drilldownInfo
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.dataUpdation) {
      this.dataUpdation.unsubscribe();
    }
  }
}
