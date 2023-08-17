import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, AfterViewChecked, ViewChild } from '@angular/core';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import * as _ from 'lodash';
import { TableService } from '@app/shared/services/table/table.service';
import { ChartService } from '@app/shared/services/chart/chart.service';
import { Table } from 'primeng/table';
import * as moment from 'moment';

@Component({
  selector: 'app-normal-table',
  templateUrl: './normal-table.component.html',
  styleUrls: ['./normal-table.component.scss']
})
export class NormalTableComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() tableInfo;

  @Input() tableID: string;
  tableData: any;
  pageTitle: string;
  tableRowCount: number;
  cols = [];
  tableUpdation: Subscription;
  filters: any;
  totalRecords: number;
  isTableLoaded = false;
  defaultTableValues: any;
  headerIconNeeded = false;
  dynamicHeaders = [];
  loading = false;
  colSpanLength = 1;
  tableHeight: string;
  constants: any;
  isScrollActivated = false;
  isPaginatorNeeded = false;
  deviceId = null;
  @ViewChild('dt', { static: false }) table: Table;

  constructor(
    private dashboardService: DashBoardService,
    private dataUpdationService: DataUpdateService,
    private config: AppConfigService,
    private filterService: FilterService,
    private tableService: TableService,
    private chartService: ChartService,
    private changeRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.constants = this.config.getConstants();
    this.initTableProperties();
    this.initTableDataUpdation();
  }

  ngAfterViewChecked() {
    this.calcTableStyle();
  }

  initTableDataUpdation() {
    if (this.tableInfo.deviceDependentRefresh) {
      this.tableUpdation = this.dataUpdationService.updateDeviceData$.subscribe(async event => {
        this.deviceId = event.id;
        this.initTableData(event.type);
      });
    } else {
      // this.tableUpdation = this.dataUpdationService.updateLiveData$.subscribe(async event => {
      this.initTableData();
      // });
    }
  }

  async initTableData(event = {}) {
    this.calcTableHeight();
    this.loading = true;
    if (this.table && event && event != 'AutoRefreshEvent') {
      this.table.reset();
    }
    if (this.tableInfo && this.tableInfo.dataEndPoint) {
      try {
        this.pageTitle = this.tableInfo.title;
        this.isTableLoaded = true;
        // let tableData;
        // tableData = await this.getTableData(this.deviceId);
        this.tableData = [
          { depth: 1967.42, inc: 90.74, azi: 153.54, tvd: 448.53 },
          { depth: 1967.42, inc: 90.74, azi: 153.54, tvd: 448.53 },
          { depth: 1967.42, inc: 90.74, azi: 153.54, tvd: 448.53 },
          { depth: 1967.42, inc: 90.74, azi: 153.54, tvd: 448.53 }
        ];
        this.createTableHeaders();
        // if (tableData && tableData.length) {
        // this.tableData = this.processTableData(tableData);
        // } else {
        // this.tableData = [];
        // this.isPaginatorNeeded = false;
        // }
        this.isPaginatorNeeded = this.tableData.length > this.tableRowCount;
        this.headerIconNeeded = this.tableData.length > 0 && this.tableInfo.csvEndpoint;
      } catch (err) {
        this.dashboardService.logError(err);
      } finally {
        this.loading = false;
        this.calcTableHeight();
        this.calcTableStyle();
      }
    }
  }

  calcTableStyle() {
    const tblComponent = document.getElementById(this.tableInfo.id);
    if (tblComponent) {
      const primengTable = tblComponent.getElementsByClassName('ui-table-scrollable-body')[0];
      if (primengTable) {
        const { scrollHeight, clientHeight } = primengTable;
        if (this.isScrollActivated !== scrollHeight > clientHeight) {
          this.isScrollActivated = !this.isScrollActivated;
          this.changeRef.detectChanges();
        }
      }
    }
  }

  calcTableHeight() {
    const parentGrid = document.getElementById(this.tableID);
    if (parentGrid && parentGrid.style.height) {
      const headerAndPaginatorHeight = this.isPaginatorNeeded ? '11vh - 2.6em' : '11vh';
      this.tableHeight = 'calc(' + parentGrid.style.height + ' - ' + headerAndPaginatorHeight + ')';
      this.changeRef.detectChanges();
    } else {
      // this.tableHeight = '11vh';
    }
  }

  onResize() {
    this.calcTableHeight();
    this.calcTableStyle();
  }

  processTableData(tableData) {
    const flattenedData = [];
    tableData.forEach(data => {
      const currentEntry: any = {};
      const keys = Object.keys(data);
      for (const key of keys) {
        if (data[key] instanceof Array) {
          const subArray = data[key];
          subArray.forEach(entry => {
            const subKeys = Object.keys(entry);
            if (entry[subKeys[0]]) {
              currentEntry[entry[subKeys[0]]] = entry[subKeys[1]];
            } else {
              if (entry[subKeys[1]]) {
                currentEntry.noTvAppVersion = entry[subKeys[1]];
              }
            }
            if (!this.dynamicHeaders.includes(entry[subKeys[0]]) && entry[subKeys[0]]) {
              this.dynamicHeaders.push(entry[subKeys[0]]);
            }
          });
        } else {
          currentEntry[key] = data[key];
        }
      }
      flattenedData.push(currentEntry);
    });
    this.colSpanLength = this.dynamicHeaders.length;
    flattenedData.sort(this.tableService.compare);
    return flattenedData;
  }

  createTableHeaders() {
    this.cols = [
      { header: 'DEPTH', field: 'depth' },
      { header: 'INC', field: 'inc' },
      { header: 'AZI', field: 'azi' },
      { header: 'TVD', field: 'tvd' }
    ];
    // this.cols = _.cloneDeep(this.tableInfo.tableHeaderAndFieldNames);
    // if (this.dynamicHeaders && this.dynamicHeaders.length) {
    //   const { dynamicHeaderStartName, isDynamicColsClickable } = this.tableInfo;
    //   this.dynamicHeaders.forEach(fieldName => {
    //     if (fieldName) {
    //       const headerAndFieldName: any = {};
    //       headerAndFieldName.field = fieldName;
    //       const header = dynamicHeaderStartName ? `${dynamicHeaderStartName}(${fieldName})` : fieldName;
    //       headerAndFieldName.header = header;
    //       if (isDynamicColsClickable) {
    //         headerAndFieldName.isClickable = isDynamicColsClickable;
    //       }
    //       this.cols.push(headerAndFieldName);
    //     }
    //   });
    //   this.dynamicHeaders = [];
    // }
  }

  initTableProperties() {
    if (!this.tableInfo) {
      return;
    } else {
      const tableDefaultValue = this.config.getConstants();
      if (this.tableInfo.tableRowCount) {
        this.tableRowCount = this.tableInfo.tableRowCount;
      } else {
        this.tableRowCount = 4;
      }
    }
  }

  getTableData(deviceId) {
    let params = {};
    if (this.tableInfo.isTimeIntervalNeeded) {
      const timeSlot = this.dataUpdationService.selectedDateRange
        ? this.dataUpdationService.selectedDateRange
        : this.dataUpdationService.selectedTimeRange;
      params['timeSlot'] = timeSlot;
    }
    if (this.tableInfo.isFilterDependent) {
      const filterParams = this.filterService.getAppliedFilters();
      params = { ...params, ...filterParams };
    }
    if (deviceId) {
      params['deviceId'] = deviceId;
    }
    if (this.tableInfo.parameter) {
      params['parameter'] = this.tableInfo.parameter;
    }
    if (this.dataUpdationService.selectedDateRange) {
      params['startTime'] = this.dataUpdationService.selectedDates[0];
      params['endTime'] = this.dataUpdationService.selectedDates[1];
    }
    return this.dashboardService.getDashBoardData(this.tableInfo.dataEndPoint, params, this.tableInfo.isPostReq);
  }

  downloadCsv() {
    // this.chartService.downloadCsv(this.tableInfo.csvEndpoint, this.tableInfo.parameter);
  }

  ngOnDestroy() {
    if (this.tableUpdation) {
      this.tableUpdation.unsubscribe();
    }
  }
}
