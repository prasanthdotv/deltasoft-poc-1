import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { DashboardPagesService } from '@app/pages/services/dashboard-pages/dashboard-pages.service';
import { GridsterConfig, GridsterItem, GridType } from 'angular-gridster2';
import { GridsterOptions } from '@app/core/config/gridsterOptions';

export class BaseComponent {
  dashBoardPagesContent: any[];
  selectedTimeRange: number;
  customDateRangeEnabled: boolean = false;
  customTimeRange: any[];
  constants: any;
  public dashboardPagesOptions: GridsterConfig;
  public dashBoardPagesItems: GridsterItem[];
  width: number;
  height: number;
  pageContent: any;
  isAutoRefreshNeeded = true;
  isTimeChangeRequired = true;
  bIPages: any[];
  latest15MinDataPages: any[];
  filterFromURL: any = null;
  biReportRefreshTimeout = null;
  filterCount: number;
  filters = [];
  backgroundRefreshPages: any[];
  isBackgroundRefreshNeeded = false;
  webSocketEvent;

  constructor(
    protected dataUpdateService: DataUpdateService,
    protected dashboardPageService: DashboardPagesService) {
  }

  initBIReportPageRefresh() {
    const timeout = this.dashboardPageService.getTimeout(1, 0);
    this.biReportRefreshTimeout = setTimeout(() => {
      window.location.reload();
    }, timeout);
  }

  setDefaultTimeSelection() {
    this.customDateRangeEnabled = false;
    this.selectedTimeRange = this.constants.defaultTimeRange;
    this.dataUpdateService.setDefaultTimeSelection();
  }

  clearDashboard() {
    this.dashBoardPagesContent = null;
    this.pageContent = {};
  }

  setOptions(routeData) {
    const path = routeData[0].path;
    if (this.backgroundRefreshPages.includes(path)) {
      this.isBackgroundRefreshNeeded = true;
    }
  }

  initGridster() {
    this.dashBoardPagesContent = [];
    this.dashboardPagesOptions = {};
    this.dashBoardPagesContent = this.pageContent.components;
    this.dashBoardPagesItems = this.pageContent.layout;
    this.dashboardPagesOptions = {
      fixedColWidth: this.getPageWidth(),
      fixedRowHeight: this.getPageHeight(),
      ...GridsterOptions.options
    };
    if (!this.constants.fixedScreenPages.includes(this.pageContent.page_id) && this.width >= 1920 && this.height >= 1080) {
      this.dashboardPagesOptions.gridType = GridType.Fit;
    }
  }

  onResize(event) {
    this.width = event.target.innerWidth;
    this.height = event.target.innerHeight;
    this.dashboardPagesOptions.fixedColWidth = this.getPageWidth();
    this.dashboardPagesOptions.fixedRowHeight = this.getPageHeight();
    if (!this.constants.fixedScreenPages.includes(this.pageContent.page_id) && this.width >= 1920 && this.height >= 1080) {
      this.dashboardPagesOptions.gridType = GridType.Fit;
    } else {
      this.dashboardPagesOptions.gridType = GridType.Fixed;
    }
    this.changedOptions();
  }

  getPageWidth() {
    const width = (this.width - 86) / 12 - 12;
    return width;
  }

  getPageHeight() {
    return this.height / 25.5;
  }

  changedOptions() {
    this.dashboardPagesOptions.api.optionsChanged();
    this.dashboardPagesOptions.api.resize();
  }

  getGridsterItem(id) {
    for (const item of this.dashBoardPagesItems) {
      if (item.id === id) {
        return item;
      }
    }
  }

  clearTimeoutForBIPages() {
    clearTimeout(this.biReportRefreshTimeout);
    this.biReportRefreshTimeout = null;
  }

}
