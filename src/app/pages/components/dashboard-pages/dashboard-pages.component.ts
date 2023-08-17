import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { DashboardPagesService } from '@app/pages/services/dashboard-pages/dashboard-pages.service';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from '../base-component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-pages',
  templateUrl: './dashboard-pages.component.html',
  styleUrls: ['./dashboard-pages.component.scss']
})
export class DashboardPagesComponent extends BaseComponent implements OnInit, AfterViewChecked, OnDestroy {
  backgroundRefreshPages: any[];
  filterSubscription: Subscription;
  showFilter = false;
  isFilterPinned = false;
  filterTimeout: any;
  isFilterTimeoutStopped = false;

  constructor(
    private currentRoute: ActivatedRoute,
    private config: AppConfigService,
    dataUpdateService: DataUpdateService,
    dashboardPageService: DashboardPagesService,
    private filterService: FilterService,
    private toastr: ToastrService,
    private router: Router
  ) {
    super(dataUpdateService, dashboardPageService);
  }

  async ngOnInit() {
    this.initProperties();
    this.createPageOnRouteChange();
    // this.initFilterPanel();
    // this.onFilterToggle();
  }

  onFilterToggle() {
    this.filterSubscription = this.filterService.toggleFilter$.subscribe(() => {
      this.toggleFilter();
    });
  }

  initFilterPanel() {
    const isFilterPinned = this.filterService.getFilterState();
    if (isFilterPinned === 'pinned') {
      this.isFilterPinned = true;
    } else {
      this.isFilterPinned = false;
      this.showFilter = false;
    }
  }

  initProperties() {
    this.constants = this.config.getConstants();
    this.dataUpdateService.setTimezoneString();
    const { timeRange, biPages, backgroundRefreshPages, latest15MinDataPages } = this.constants;
    this.backgroundRefreshPages = backgroundRefreshPages;
    this.bIPages = biPages;
    this.latest15MinDataPages = latest15MinDataPages;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.customTimeRange = this.dashboardPageService.generateTimeRange(timeRange);
  }

  ngAfterViewChecked() {
    if (this.filterTimeout || this.isFilterTimeoutStopped) {
      const nebularDropdown = document.getElementsByClassName('options-list-container')[0];
      const primengDropdown = document.getElementsByClassName('ui-dropdown-filter-container')[0];
      if (nebularDropdown || primengDropdown) {
        if (this.filterTimeout) {
          this.clearFilterTimeout();
          this.isFilterTimeoutStopped = true;
        }
      } else {
        if (this.isFilterTimeoutStopped) {
          this.isFilterTimeoutStopped = false;
          this.startFilterTimeout();
        }
      }
    }
  }

  toggleFilter() {
    if (this.isFilterPinned) {
      return;
    }
    this.showFilter = !this.showFilter;
    if (this.showFilter) {
      this.startFilterTimeout();
    } else {
      this.clearFilterTimeout();
    }
  }

  startFilterTimeout() {
    const timeout = this.constants.filterTimeout;
    if (this.filterTimeout) {
      this.clearFilterTimeout();
    }
    this.filterTimeout = setTimeout(() => {
      this.showFilter = false;
    }, timeout);
  }

  changeFilterState() {
    const filterState = this.filterService.getFilterState();
    if (filterState === 'pinned') {
      this.filterService.setFilterState(false);
      this.isFilterPinned = false;
    } else {
      this.filterService.setFilterState(true);
      this.isFilterPinned = true;
    }
    if (this.showFilter) {
      this.showFilter = false;
    }
    if (this.filterTimeout) {
      this.clearFilterTimeout();
    }
  }

  clearFilterTimeout() {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = null;
  }

  createPageOnRouteChange() {
    this.currentRoute.url.subscribe(routeData => {
      if (this.filterTimeout && this.showFilter) {
        this.clearFilterTimeout();
        this.showFilter = false;
      }
      this.setDefaultTimeSelection();
      this.filterFromURL = this.currentRoute.snapshot.queryParams;
      this.clearDashboard();
      const pageContent = this.dashboardPageService.getPageContent(routeData);
      let isAuthorized = false;
      if (pageContent && pageContent.page_id) {
        isAuthorized = true;
      }
      // if (isAuthorized) {
      if (this.biReportRefreshTimeout === null && this.bIPages.includes(pageContent.page_id)) {
        this.initBIReportPageRefresh();
      } else if (this.biReportRefreshTimeout && !this.bIPages.includes(pageContent.page_id)) {
        this.clearTimeoutForBIPages();
      }
      this.pageContent = pageContent;
      this.filters = pageContent.filters ? pageContent.filters : [];
      this.filterCount = this.filters ? this.filters.length : null;
      this.setOptions(routeData);
      this.initGridster();
      // } else {
      //   this.toastr.error('Unauthorized to view the page', 'Error');
      //   // this.router.navigateByUrl(defaultPageURL);
      //   return;
      // }
    });
  }

  timeRangeChanged(event) {
    const newTimeSlot = event;
    if (!newTimeSlot) {
      this.customDateRangeEnabled = true;
    } else {
      this.customDateRangeEnabled = false;
      this.dataUpdateService.changeData(newTimeSlot, true);
    }
  }

  ngOnDestroy() {
    this.dataUpdateService.clearPageRefresh();
    this.setDefaultTimeSelection();
    this.filterService.resetFilters();
    if (this.biReportRefreshTimeout) {
      this.clearTimeoutForBIPages();
    }
    if (this.filterTimeout) {
      this.clearFilterTimeout();
    }
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }
}
