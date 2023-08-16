import { Component, OnInit, Input, OnDestroy, AfterViewChecked, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import * as _ from 'lodash';
import { ChartService } from '@app/shared/services/chart/chart.service';

@Component({
  selector: 'app-lazy-table',
  templateUrl: './lazy-table.component.html',
  styleUrls: ['./lazy-table.component.scss']
})
export class LazyTableComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() tableInfo: any;
  @Input() tableID: string;
  tableData: any;
  pageTitle: string;
  tableRowCount: number;
  cols = [];
  tableUpdation: Subscription;
  filters: any;
  totalRecords: number;
  isLazyTableInitialized = false;
  loading = true;
  isFiltersAvailable = false;
  isPaginatorNeeded = false;
  isSortingNeeded = false;
  headerIconNeeded = false;
  dynamicHeaders = [];
  @ViewChild('dt', { static: false }) table: Table;
  tableHeight: string;
  isScrollActivated = false;
  isDataAvailable: boolean;
  constants: any;

  constructor(
    private dashboardService: DashBoardService,
    private dataUpdationService: DataUpdateService,
    private config: AppConfigService,
    private filterService: FilterService,
    private changeRef: ChangeDetectorRef,
    private chartService: ChartService
  ) {}

  async ngOnInit() {
    this.constants = this.config.getConstants();
    this.initTableProperties();
    this.initTableDataUpdation();
  }

  ngAfterViewChecked() {
    this.setTableStyle();
  }

  onResize() {
    this.calcTableHeight();
  }

  initTableDataUpdation() {
    this.tableUpdation = this.dataUpdationService.updateLiveData$.subscribe(async () => {
      if (!this.isFiltersAvailable) {
        this.isFiltersAvailable = true;
        this.loadPageTitle();
      } else {
        this.initTableData();
      }
    });
  }

  async loadData(event: LazyLoadEvent) {
    this.loading = true;
    if (!event && this.table) {
      this.table.reset();
    }
    const offset = event && event.first ? event.first : 0;
    const limit = event && event.rows ? event.rows : this.tableRowCount;
    const options: any = {
      offset,
      limit
    };
    if (event && this.isSortingNeeded) {
      if (event.sortOrder) {
        options.sortOrder = event.sortOrder;
      }
      if (event.sortField) {
        options.sortField = event.sortField;
      }
    }
    try {
      const response = await this.getTableData(options);
      if (response) {
        const totalRecords = response.length;
        this.totalRecords = totalRecords ? totalRecords : 0;
        const tableData = response;
        if (tableData) {
          this.tableData = tableData;
          if (!this.isLazyTableInitialized) {
            this.table.resetPageOnSort = false;
            this.isLazyTableInitialized = true;
          }
          this.isPaginatorNeeded = this.totalRecords > this.tableRowCount;
          const isDataAvailable = this.tableData.length > 0;
          this.headerIconNeeded = isDataAvailable && this.tableInfo.csvEndpoint;
          if (this.isDataAvailable !== isDataAvailable) {
            this.isDataAvailable = isDataAvailable;
          }
        }
      }
    } catch (err) {
      this.dashboardService.logError(err);
    } finally {
      this.calcTableHeight();
      this.loading = false;
    }
  }

  calcTableHeight() {
    const gridElement = document.getElementById(this.tableID);
    if (gridElement && gridElement.style.height) {
      const headerAndPaginatorHeight = this.isPaginatorNeeded ? '19vh' : '14vh';
      this.tableHeight = 'calc(' + gridElement.style.height + ' - ' + headerAndPaginatorHeight + ')';
      this.changeRef.detectChanges();
    } else {
      this.tableHeight = this.constants.tableHeight;
    }
  }

  setTableStyle() {
    const tableBody = document.getElementsByClassName('ui-table-scrollable-body')[0];
    if (tableBody) {
      const { scrollHeight, clientHeight } = tableBody;
      if (this.isScrollActivated !== scrollHeight > clientHeight) {
        this.isScrollActivated = !this.isScrollActivated;
        this.changeRef.detectChanges();
      }
    }
  }

  initTableData() {
    this.loadPageTitle();
    if (this.tableInfo) {
      this.loadData(null);
    }
  }

  loadPageTitle() {
    const selectedDate = this.filterService.getSpecificFilter('date');
    if (selectedDate) {
      this.pageTitle = selectedDate;
    }
  }

  createTableHeaders() {
    this.cols = [];
    this.cols = this.tableInfo.tableHeaderAndFieldNames;
  }

  initTableProperties() {
    if (!this.tableInfo) {
      return;
    } else {
      this.createTableHeaders();
      this.isSortingNeeded = this.tableInfo.isSortingNeeded;
      const tableDefaultValue = this.config.getConstants();
      if (this.tableInfo.tableRowCount) {
        this.tableRowCount = this.tableInfo.tableRowCount;
      } else {
        this.tableRowCount = tableDefaultValue.tableRowCount;
      }
    }
  }

  getTableData(options) {
    const filterParams = this.filterService.getAppliedFilters();
    const params = {
      dataType: this.tableInfo.dataType,
      ...filterParams
    };
    if (this.tableInfo.dataType) {
      params.dataType = this.tableInfo.dataType;
    }
    return this.dashboardService.getDashBoardData(this.tableInfo.dataEndPoint, params);
  }

  downloadCsv() {
    this.chartService.downloadCsv(this.tableInfo.csvEndpoint, this.tableInfo.parameter);
  }

  ngOnDestroy() {
    if (this.tableUpdation) {
      this.tableUpdation.unsubscribe();
    }
  }
}
