import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppConfigService } from '../app-config/app-config.service';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class DataUpdateService {
  deviceId: string;
  deviceTmZn: string;
  selectedTimeRange: number;
  selectedDateRange: any;
  selectedDates: any[];
  selectedRefreshTime: number;
  refreshTimeCounter: any;
  appConfiguration: any;
  graphTimeRange: any = {};
  graphTimeRangeWithTmZn: any = {};
  tzOffset: number = null;
  tzString: string;
  lastTwoDaysStartTime: Date;

  constructor(private config: AppConfigService) {
    this.appConfiguration = this.config.getConstants();
    this.selectedRefreshTime = this.appConfiguration.defaultRefreshTime;
  }

  private updateDeviceData = new BehaviorSubject(null);
  private updateLiveData = new Subject();
  private updateReportData = new Subject();
  private updateTimezone = new Subject();
  private filterItemChanged = new Subject();

  updateDeviceData$ = this.updateDeviceData.asObservable();
  updateLiveData$ = this.updateLiveData.asObservable();
  updateReportData$ = this.updateReportData.asObservable();
  updateTimezone$ = this.updateTimezone.asObservable();
  filterItemChanged$ = this.filterItemChanged.asObservable();

  filterChanged() {
    this.calcTimeRange();
    this.updateLiveData.next('FilterEvent');
    this.updateReportData.next('FilterEvent');
    this.filterItemChanged.next();
  }
  changeDataForDateRange(dates: any[], timeSlot) {
    this.selectedDates = dates;
    this.selectedDateRange = timeSlot;
    this.selectedTimeRange = null;
    this.calcTimeRange();
    this.updateLiveData.next('TimeEvent');
  }
  changeData(timeSlot, isFilterChangeEvent) {
    this.selectedTimeRange = timeSlot;
    this.selectedDateRange = null;
    this.selectedDates = null;
    this.calcTimeRange();
    this.updateLiveData.next('TimeEvent');
    if (isFilterChangeEvent) {
      this.filterItemChanged.next();
    }
  }

  getTimezoneOffset() {
    const newTimezoneOffset = new Date().getTimezoneOffset();
    if (newTimezoneOffset != this.tzOffset) {
      this.tzOffset = newTimezoneOffset;
      this.setTimezoneString();
    }
    return this.tzOffset;
  }

  setTimezoneString() {
    const timezone = this.deviceTmZn ? this.deviceTmZn : Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.tzString =
      moment.tz(timezone).zoneAbbr() + ' - ' + timezone + ' (' + moment.tz().zoneAbbr() + moment.tz(timezone).format('Z') + ')';
    this.updateTimezone.next();
  }

  updateRefreshTime(newRefreshTime, isFilterChangeEvent?) {
    this.selectedRefreshTime = newRefreshTime;
    this.setRefreshCounter(true);
    if (isFilterChangeEvent) {
      this.filterItemChanged.next();
    }
  }

  getSelectedTimeRange() {
    return this.selectedTimeRange;
  }

  getSelectedRefreshTime() {
    return this.selectedRefreshTime;
  }

  setRefreshCounter(newRefreshTime?) {
    if (newRefreshTime) {
      clearInterval(this.refreshTimeCounter);
    }
    if (this.selectedRefreshTime) {
      this.refreshTimeCounter = setInterval(() => {
        if (document.visibilityState === 'visible') {
          if (this.deviceId && this.deviceTmZn) {
            this.calcTimeRangeWithTimeZone();
            this.updateDeviceData.next({
              type: 'AutoRefreshEvent',
              id: this.deviceId
            });
          } else {
            this.calcTimeRange();
            this.updateLiveData.next('AutoRefreshEvent');
          }
        }
      }, this.selectedRefreshTime * 1000);
    }
  }

  setDefaultTimeSelection() {
    this.selectedDateRange = null;
    this.selectedDates = null;
    this.selectedTimeRange = this.appConfiguration.selectedTimeRange;
  }

  clearPageRefresh() {
    if (this.refreshTimeCounter) {
      clearInterval(this.refreshTimeCounter);
    }
  }

  calcTimeRange() {
    const { twoDays } = this.appConfiguration.daysInHrs;
    this.lastTwoDaysStartTime = new Date();
    this.lastTwoDaysStartTime.setMinutes(this.lastTwoDaysStartTime.getMinutes() - twoDays * 60);
    this.lastTwoDaysStartTime.setSeconds(0, 0);
    if (this.selectedDates) {
      const dateFrom = new Date(this.selectedDates[0]);
      const dateUpto = new Date(this.selectedDates[1]);
      this.graphTimeRange.minTime = moment(dateFrom).toISOString();
      this.graphTimeRange.maxTime = moment(dateUpto).toISOString();
    } else {
      const maxDate = new Date();
      const minDate = new Date();
      const timeSlot = this.selectedTimeRange;
      minDate.setHours(minDate.getHours() - timeSlot);
      minDate.setSeconds(0);
      minDate.setMilliseconds(0);
      maxDate.setSeconds(0);
      maxDate.setMilliseconds(0);
      this.graphTimeRange.maxTime = maxDate.toISOString();
      this.graphTimeRange.minTime = minDate.toISOString();
    }
  }

  calcTimeRangeWithTimeZone() {
    const maxDate = new Date();
    const minDate = new Date();
    const timeSlot = this.selectedTimeRange;
    minDate.setHours(minDate.getHours() - timeSlot);
    minDate.setSeconds(0);
    minDate.setMilliseconds(0);
    maxDate.setSeconds(0);
    maxDate.setMilliseconds(0);
    this.graphTimeRangeWithTmZn.maxTime = moment(maxDate)
      .tz(this.deviceTmZn)
      .format('YYYY-MM-DD HH:mm:ss');
    this.graphTimeRangeWithTmZn.minTime = moment(minDate)
      .tz(this.deviceTmZn)
      .format('YYYY-MM-DD HH:mm:ss');
  }

  refreshDeviceDetailsDashboard(event, timeslot?) {
    if (timeslot) {
      this.selectedTimeRange = timeslot;
    } else {
      this.setDefaultTimeSelection();
    }
    this.selectedDateRange = null;
    this.selectedDates = null;
    this.calcTimeRangeWithTimeZone();
    this.updateDeviceData.next({ type: event, id: this.deviceId });
  }

  setDeviceDetails(deviceId, timezone) {
    this.deviceId = deviceId;
    this.deviceTmZn = timezone;
  }

  clearDeviceDetails() {
    this.deviceId = null;
    this.deviceTmZn = null;
  }

  refreshDashboard() {
    if (this.deviceId && this.deviceTmZn) {
      this.calcTimeRangeWithTimeZone();
      this.updateDeviceData.next({
        type: 'ManualRefreshEvent',
        id: this.deviceId
      });
    } else {
      this.calcTimeRange();
      this.updateLiveData.next('ManualRefreshEvent');
      this.updateReportData.next('ManualRefreshEvent');
    }
  }

  refreshInBackground() {
    this.updateRefreshTime(this.appConfiguration.backgroundRefreshTime);
  }

  setLabels(timeSlot) {
    const { aggregationLevels, aggregationLabels, daysInHrs } = this.appConfiguration;
    const selectedTimeRange = timeSlot ? timeSlot : this.selectedTimeRange;
    const key = selectedTimeRange > aggregationLevels[1] ? 'day' : selectedTimeRange <= aggregationLevels[0] ? '15 minutes' : 'hour';
    const aggregatesLabel = aggregationLabels[key];
    const timeRangeLabel =
      selectedTimeRange < daysInHrs.oneDay ? selectedTimeRange + ' hour' : selectedTimeRange / daysInHrs.oneDay + ' day';
    return { aggregatesLabel, timeRangeLabel };
  }

  setLabelsForCustomTimeRange(timeInfo) {
    const { aggregationLabels, aggregationLevels } = this.appConfiguration;
    let timeRangeLabel;
    let aggregatesLabel;
    let startDate;
    let endDate;
    if (timeInfo && timeInfo.dateStartTime && timeInfo.dateEndTime) {
      const { dateStartTime, dateEndTime } = timeInfo;
      startDate = new Date(dateStartTime);
      endDate = new Date(dateEndTime);
      timeRangeLabel = this.formatLabel(dateStartTime) + ' - ' + this.formatLabel(dateEndTime);
    } else {
      startDate = new Date(this.selectedDates[0]);
      endDate = new Date(this.selectedDates[1]);
      timeRangeLabel = this.formatLabel(this.selectedDates[0]) + ' - ' + this.formatLabel(this.selectedDates[1]);
    }
    const timeRangeInMilliSec = endDate.getTime() - startDate.getTime();
    if (startDate >= this.lastTwoDaysStartTime) {
      if (timeRangeInMilliSec <= aggregationLevels[0] * 60 * 60 * 1000) {
        aggregatesLabel = aggregationLabels['15 minutes'];
      } else {
        aggregatesLabel = aggregationLabels['hour'];
      }
    } else {
      aggregatesLabel = aggregationLabels['day'];
    }
    return { aggregatesLabel, timeRangeLabel };
  }

  titleCreator(chartConfig, timeInfo?) {
    let timeLabel;
    if (timeInfo) {
      timeLabel =
        timeInfo.dateStartTime && timeInfo.dateEndTime ? this.setLabelsForCustomTimeRange(timeInfo) : this.setLabels(timeInfo.timeSlot);
    } else {
      timeLabel = this.selectedDateRange ? this.setLabelsForCustomTimeRange(null) : this.setLabels(null);
    }
    const { aggregatesLabel, timeRangeLabel } = timeLabel;
    let title = '';
    if (chartConfig.titleAddOn) {
      title += chartConfig.titleAddOn;
    }
    if (chartConfig.durationRequired) {
      if (chartConfig.durationSeperator) {
        title += chartConfig.durationSeperator;
      }
      if (chartConfig.durationTypeOnTitle === 'aggregate') {
        title += aggregatesLabel;
      } else if (chartConfig.durationTypeOnTitle === 'time_slot') {
        title += timeRangeLabel;
      }
    }
    title = chartConfig.title ? (title ? `${chartConfig.title} (${title})` : chartConfig.title) : title;
    return title;
  }

  formatLabel(value) {
    const selectedVal = new Date(value);
    const time = [('0' + selectedVal.getHours()).slice(-2), ('0' + selectedVal.getMinutes()).slice(-2)];
    const dates = [selectedVal.getFullYear(), selectedVal.getMonth() + 1, selectedVal.getDate()];
    const fullDate = dates.join('/') + ' ' + time.join(':');
    return fullDate;
  }
}
