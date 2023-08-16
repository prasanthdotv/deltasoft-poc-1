import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { ChartService } from '@app/shared/services/chart/chart.service';

@Component({
  selector: 'app-multi-box',
  templateUrl: './multi-box.component.html',
  styleUrls: ['./multi-box.component.scss']
})
export class MultiBoxComponent implements OnInit, OnDestroy {
  @Input() boxConfig: any;
  leftBox: any;
  rightBox: any;
  middleBox: any;
  chartUpdation: Subscription;
  isBoxLoading: boolean;
  isDataEmpty = { left: false, middle: false, right: false };
  isChartOptionsInitialized = false;
  // Included for selenium testing
  inputId: string;
  last15MinData: any;
  titleString: any;
  constants: any;
  constructor(
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private config: AppConfigService,
    private filterService: FilterService,
    private chartService: ChartService) { }

  async ngOnInit() {
    this.storeBoxIDForTesting();
    this.setTitle();
    this.initBoxDataUpdation();
  }

  // Included for selenium testing
  storeBoxIDForTesting() {
    if (this.boxConfig.id) {
      this.inputId = this.boxConfig.id;
    }
  }
  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.boxConfig, timeInfo);
  }

  initBoxDataUpdation() {
    let boxData;
    this.constants = this.config.getConstants();
    this.chartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
      this.isBoxLoading = true;
      if (event && !this.constants.refreshEvents.includes(event)) {
        this.setTitle();
      }
      try {
        boxData = await this.getBoxData();
        if (boxData) {
          this.initializeBoxes(boxData);
          this.chartService.storeTestData(this.inputId, boxData);
          this.isBoxLoading = false;
        }
      } catch (err) {
        this.dashBoard.logError(err);
      }
    });
  }

  async initializeBoxes(data) {
    const boxData = data;
    const param = this.boxConfig.parameter;
    const unit = this.boxConfig.unit ? this.boxConfig.unit : '';
    try {
      if (this.boxConfig.type.leftBox && this.boxConfig.type.leftBox.type) {
        this.isDataEmpty['left'] = !Boolean(Number(boxData.goodBoxCount));
        this.leftBox = {
          type: this.boxConfig.type.leftBox.type,
          status: this.boxConfig.type.leftBox.status,
          toolTip: `Normal ${boxData.thresholdType === 'inverse' ? '>=' : '<='} ${boxData.minThreshold} ${unit}`,
          parameter: param,
          label: boxData.goodBoxCount ? boxData.goodBoxCount : '0',
          dateFrom: boxData.dateFrom,
          dateUpto: boxData.dateUpto
        };
      } else {
        this.leftBox = null;
      }
      if (this.boxConfig.type.rightBox && this.boxConfig.type.rightBox.type) {
        this.isDataEmpty['right'] = !Boolean(Number(boxData.badBoxCount));
        this.rightBox = {
          type: this.boxConfig.type.rightBox.type,
          status: this.boxConfig.type.rightBox.status,
          toolTip: `Anomaly ${boxData.thresholdType === 'inverse' ? '<' : '>'} ${boxData.maxThreshold} ${unit}`,
          parameter: param,
          label: boxData.badBoxCount ? boxData.badBoxCount : '0',
          dateFrom: boxData.dateFrom,
          dateUpto: boxData.dateUpto
        };
      } else {
        this.rightBox = null;
      }
      if (this.boxConfig.type.middleBox && this.boxConfig.type.middleBox.type) {
        this.isDataEmpty['middle'] = !Boolean(Number(boxData.warningBoxCount));
        this.middleBox = {
          type: this.boxConfig.type.middleBox.type,
          status: this.boxConfig.type.middleBox.status,
          parameter: param,
          label: boxData.warningBoxCount ? boxData.warningBoxCount : '0',
          dateFrom: boxData.dateFrom,
          dateUpto: boxData.dateUpto
        };
        if (boxData.minThreshold === boxData.maxThreshold) {
          this.middleBox['toolTip'] = 'Warning box is not configured for this parameter.';
        } else {
          const warningValues =
            boxData.thresholdType === 'inverse'
              ? { value1: boxData.maxThreshold, value2: boxData.minThreshold }
              : { value1: boxData.minThreshold, value2: boxData.maxThreshold };
          const warningCriteria =
            boxData.thresholdType === 'inverse' ? { criteria1: '>=', criteria2: '<' } : { criteria1: '>', criteria2: '<=' };
          this.middleBox['toolTip'] = `Warning ${warningCriteria.criteria1} ${warningValues.value1} ${unit}
          and ${warningCriteria.criteria2} ${warningValues.value2} ${unit}`;
        }
      } else {
        this.middleBox = null;
      }
    } catch (err) {
      this.dashBoard.logError(err);
      return;
    }
  }

  getBoxData() {
    if (!this.boxConfig.dataEndPoint) {
      return;
    } else {
      const filterParams = this.filterService.getAppliedFilters();
      let params = {
        parameter: this.boxConfig.parameter,
        ...filterParams
      };
      return this.dashBoard.getDashBoardData(this.boxConfig.dataEndPoint, params, this.boxConfig.isPostReq);
    }
  }

  ngOnDestroy() {
    if (this.chartUpdation) {
      this.chartUpdation.unsubscribe();
    }
  }
}
