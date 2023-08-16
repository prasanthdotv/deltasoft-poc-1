import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  appliedFilters = {};
  commonFilters = {};
  constructor(
    private toastr: ToastrService,
    private dashboardService: DashBoardService
  ) { }

  private toggleFilter = new Subject();
  toggleFilter$ = this.toggleFilter.asObservable();
  filterDropdowns = {};

  onFilterToggle() {
    this.toggleFilter.next()
  }

  getFilterDropDowns() {
    return this.filterDropdowns;
  }

  setFilterDropDown(dropdowns) {
    this.filterDropdowns = dropdowns;
  }

  generateFilterDropdown(filterData, filter) {
    const filtersForDropDown = [];
    if (filterData) {
      const filterIds = Object.keys(filterData);
      if (!filter.multiSelect) {
        const allFilterSelector = { label: 'All', value: '' };
        filtersForDropDown.push(allFilterSelector);
      }
      filterIds.forEach(id => {
        if (id && filterData[id]) {
          const slot = {
            label: filterData[id],
            value: id
          };
          filtersForDropDown.push(slot);
        }
      });
    } else {
      const noData = { label: 'All', value: '' };
      filtersForDropDown.push(noData);
    }
    return filtersForDropDown;
  }

  async getFilterValues(filter) {
    if (!filter.dataEndPoint) {
      return null;
    } else {
      try {
        const response = await this.dashboardService.getDashBoardData(
          filter.dataEndPoint
        );
        return response;
      } catch (error) {
        this.toastr.error('Something went wrong', 'Error');
      }
    }
  }

  getAppliedFilters() {
    return this.appliedFilters;
  }

  getSpecificFilter(filter) {
    if (this.appliedFilters[filter]) {
      return this.appliedFilters[filter];
    }
  }

  resetFilters() {
    this.appliedFilters = {};
    this.filterDropdowns = {};
  }

  getFilterState() {
    const keyName = this.getFilterKeyName();
    return localStorage.getItem(keyName);
  }

  getFilterKeyName() {
    const email = localStorage.getItem('dish-user-email');
    const keyName = 'dish-user-' + email;
    return keyName;
  }

  setFilterState(state) {
    const keyName = this.getFilterKeyName();
    if (state) {
      localStorage.setItem(keyName, 'pinned');
    } else {
      localStorage.setItem(keyName, 'un-pinned');
    }
  }

  resetCommonFilters() {
    this.commonFilters = {};
  }
}
