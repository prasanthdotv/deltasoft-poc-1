import { ViewChild } from '@angular/core';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { DashboardPagesService } from '@app/pages/services/dashboard-pages/dashboard-pages.service';
import * as moment from 'moment';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

@Component({
  selector: 'custom-date-selector',
  templateUrl: './custom-date-selector.component.html',
  styleUrls: ['./custom-date-selector.component.scss']
})
export class CustomDateSelectorComponent implements OnInit {
  @ViewChild('rangePicker', { static: false }) rangePicker;
  @Output() dateChangeEvent = new EventEmitter<string>();
  invalidDateRange: boolean = false;
  defaultDate: any;
  maxDate: any;
  minDate: any;
  showTimeField = true;
  constants: any;

  constructor(
    private dataUpdateService: DataUpdateService, 
    private dashboardPageService: DashboardPagesService,
    private config: AppConfigService) {}

  ngOnInit() {
    this.constants = this.config.getConstants();
    this.defaultDate = null;
    this.setMinutesToZero();
  }

  setMinutesToZero() {
    this.maxDate = new Date();
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 30);
    this.minDate.setMinutes(0);
    this.maxDate.setMinutes(0);
    if (this.defaultDate && Array.isArray(this.defaultDate)) {
      if (this.defaultDate[0]) {
        const date = new Date(this.defaultDate[0]);
        date.setMinutes(0);
        this.defaultDate[0] = date;
      }
      if (this.defaultDate[1]) {
        const date = new Date(this.defaultDate[1]);
        date.setMinutes(0);
        this.defaultDate[1] = date;
      }
    } else {
      this.defaultDate = new Date();
      this.defaultDate.setMinutes(0);
    }
  }

  dateTimeRangeChanged(event) {
    const dates = [];
    this.validateDateRange();
    if (this.rangePicker.value && this.rangePicker.value[1] && !this.invalidDateRange) {
      this.toggleDatePicker();
      const isWithInLastTwoDay = this.isWithInLastTwoDays(this.rangePicker.value[0]);
      this.rangePicker.value.forEach(item => {
        if(isWithInLastTwoDay) {
          dates.push(moment(item).toISOString());
        } else {
          dates.push(moment(item).startOf('date').utc(true).toISOString());
        }
      });
      const timeSlot = this.dashboardPageService.calculateTimeSlot(dates);
      this.dataUpdateService.changeDataForDateRange(dates, timeSlot);
      this.dateChangeEvent.emit();
    } else {
      this.toggleDatePicker();
    }
  }

  validateDateRange() {
    if (this.rangePicker.value && this.rangePicker.value[1]) {
      const dateFrom = new Date(this.rangePicker.value[0]);
      const dateUpto = new Date(this.rangePicker.value[1]);
      if (dateFrom.getTime() >= dateUpto.getTime()) {
        this.invalidDateRange = true;
      } else {
        this.invalidDateRange = false;
      }
    } else if (this.rangePicker.value && this.rangePicker.value[0]) {
      const dateFrom = new Date(this.rangePicker.value[0]);
      this.showTimeField = this.isWithInLastTwoDays(dateFrom);
      if(!this.showTimeField) {
        this.rangePicker.currentHour = 0;
        this.rangePicker.currentMinute = 0;
        this.rangePicker.currentSecond = 0;
        this.rangePicker.value[0].setHours(0, 0, 0);
      }
    } else {
      this.invalidDateRange = true;
    }
  }

  isWithInLastTwoDays(dateFrom) {
    let isWithInLastTwoDays = true;
    const {oneDay} = this.constants.days;
    const lastTwoDaysStartTime = new Date();
    lastTwoDaysStartTime.setDate(lastTwoDaysStartTime.getDate() - oneDay);
    lastTwoDaysStartTime.setHours(0, 0, 0, 0);
    // Checking if the selected time range is within last 2 days
    isWithInLastTwoDays = dateFrom && (dateFrom >= lastTwoDaysStartTime);
    return isWithInLastTwoDays;
  }

  toggleDatePicker() {
    this.rangePicker.overlayVisible = !this.rangePicker.overlayVisible;
  }
}
