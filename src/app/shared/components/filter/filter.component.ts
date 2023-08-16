import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnChanges {
  @Input() filterConfig: any;
  @Input() filterFromURL: any = {};
  @Input() isAutoRefreshNeeded: boolean;
  @Input() isBackgroundRefreshNeeded: boolean;
  previousPage = '';
  selectedFilters = {};
  filterModel = {};
  dropdowns = {};
  filtersWhenOffline = {};
  constants: any;

  constructor(
    private filterService: FilterService,
    private dataUpdateService: DataUpdateService,
    private spinner: NgxSpinnerService,
    private appConfigService: AppConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.onNetworkOnlineEvent();
    this.getConstants();
  }

  getConstants() {
    this.constants = this.appConfigService.getConstants();
  }

  onNetworkOnlineEvent() {
    window.addEventListener('online', this.refresh.bind(this));
  }

  ngOnChanges() {
    this.initFilters();
  }

  async initFilters() {
    this.spinner.show();
    this.dataUpdateService.clearPageRefresh();
    await this.createFiltersDropDowns();
    this.resetFilters();
    this.filterService.appliedFilters = _.clone(this.selectedFilters);
    this.dataUpdateService.filterChanged();
    if (this.isAutoRefreshNeeded) {
      this.dataUpdateService.setRefreshCounter(true);
    } else if (this.isBackgroundRefreshNeeded) {
      this.dataUpdateService.refreshInBackground();
    }
    this.spinner.hide();
  }

  refresh() {
    this.filtersWhenOffline = _.cloneDeep(this.filterService.commonFilters);
    this.initFilters();
  }

  resetFilters() {
    this.filterFromURL = {};
    this.filtersWhenOffline = {};
  }

  async createFiltersDropDowns() {
    this.filterService.resetFilters();
    this.selectedFilters = {};
    this.dropdowns = {};
    for (const filter of this.filterConfig) {
      const filterName = filter.name;
      const isFilterToBeModified = filter.isFilterToBeModified
        ? filter.isFilterToBeModified
        : false;
      if (filterName === 'duration') {
        this.dropdowns[filterName] = this.constants.appsDurationRange;
      }
      if (filter.dataEndPoint) {
        const filterData = await this.filterService.getFilterValues(filter);
        if (isFilterToBeModified) {
          this.dropdowns[
            filterName
          ] = this.filterService.generateFilterDropdown(filterData, filter);
        } else if (filterName === 'date') {
          this.dropdowns[filterName] = this.formatDateFilter(filterData);
        } else {
          this.dropdowns[filterName] = filterData;
        }
      }
      const filterToBeApplied = this.dropdowns[filterName];
      const commonFilterVal = this.filterService.commonFilters[filterName];
      if (filterToBeApplied && filterToBeApplied[0]) {
        let isCommonFilter = false;
        const availableFilterValues = this.getFilterValue(filterToBeApplied);
        if (commonFilterVal) {
          isCommonFilter = this.checkForCommonFilters(availableFilterValues, commonFilterVal, filter);
        }
        if (
          this.filtersWhenOffline &&
          this.filtersWhenOffline.hasOwnProperty(filterName)
        ) {
          this.selectedFilters[filterName] = this.filtersWhenOffline[
            filterName
          ];
        } else if (
          this.filterFromURL &&
          this.filterFromURL[filterName] &&
          availableFilterValues.includes(this.filterFromURL[filterName])
        ) {
          this.selectedFilters[filterName] = this.filterFromURL[filterName];
        } else if (commonFilterVal && isCommonFilter) {
          this.selectedFilters[filterName] = commonFilterVal;
        }
        else {
          this.selectedFilters[filterName] = filter.multiSelect ? availableFilterValues : filterToBeApplied[0].value;
        }
      } else {
        this.selectedFilters[filterName] = '';
      }
      if (filter.multiSelect) {
        this.filterModel[filterName] = [];
        if (this.selectedFilters[filterName]) {
          this.selectedFilters[filterName].forEach(val => {
            const index = _.findIndex(this.dropdowns[filterName], [
              'value',
              val
            ]);
            this.filterModel[filterName].push(this.dropdowns[filterName][index]);
          });
        }
      } else {
        const index = _.findIndex(this.dropdowns[filterName], [
          'value',
          this.selectedFilters[filterName]
        ]);
        this.filterModel[filterName] = this.dropdowns[filterName][index];
      }
    }
    this.filterService.setFilterDropDown(this.dropdowns);
  }

  checkForCommonFilters(availableFilterValues, commonFilterVal, filter) {
    let isCommonFilter = false;
    if (filter.multiSelect) {
      isCommonFilter = commonFilterVal.every(val => availableFilterValues.includes(val));
    } else {
      isCommonFilter = availableFilterValues.includes(commonFilterVal)
    }
    return isCommonFilter;
  }

  formatDateFilter(filterData) {
    if (filterData) {
      let lastDay: any = this.getLastDay();
      lastDay = this.formatDate(lastDay);
      if (filterData.length && filterData[0].value === lastDay) {
        filterData[0].label = 'Last Day';
      } else {
        const filter = this.getLastDayForDropdown(lastDay);
        filterData.unshift(filter);
        if (filterData.length > this.constants.maxDaysInFilter) {
          filterData.pop();
        }
      }
      return filterData;
    } else {
      return [];
    }
  }

  getLastDay() {
    const date = new Date();
    const currentUTCTime = date.getTime();
    const refreshTime = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      19,
      30
    );
    if (currentUTCTime >= refreshTime) {
      return date;
    } else {
      date.setDate(date.getDate() - 1);
      return date;
    }
  }

  formatDate(date) {
    let month = '' + (date.getUTCMonth() + 1);
    let day = '' + date.getUTCDate();
    const year = date.getUTCFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  getLastDayForDropdown(lastDay) {
    const filter = {
      value: lastDay,
      label: 'Last Day'
    };
    return filter;
  }

  getFilterValue(filterData) {
    return filterData.map(filter => filter.value);
  }

  filterChange(event, filter, isMultiSelect) {
    const { name: filterName, label } = filter;
    let value: any;
    if (event.value) {
      if (isMultiSelect) {
        if (!event.value.length) {
          value = event.value;
          this.toastr.warning(`${label} is required`, 'Warning');
        } else {
          value = event.value.map(entry => entry.value);
        }
      } else {
        value = event.value.value;
      }
    }
    this.selectedFilters[filterName] = value;
    this.filterService.commonFilters[filterName] = value;
    if (!isMultiSelect) {
      this.filterService.appliedFilters[filterName] = value;
      this.dataUpdateService.filterChanged();
    }
  }

  onPanelHide(filterName) {
    const selectedFilters = this.selectedFilters[filterName];
    const appliedFilters = this.filterService.appliedFilters[filterName];
    const isEqual = (selectedFilters.every(val => appliedFilters.includes(val)) &&
      appliedFilters.every(val => selectedFilters.includes(val)));
    if (!isEqual) {
      this.filterService.appliedFilters[filterName] = _.clone(selectedFilters);
      this.dataUpdateService.filterChanged();
    }
  }
}
