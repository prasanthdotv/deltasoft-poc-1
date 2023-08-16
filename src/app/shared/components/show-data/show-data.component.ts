import { Component, Input, OnInit } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DeviceDetailsService } from '@app/pages/services/device-details/device-details.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NbDialogService } from '@nebular/theme';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';

@Component({
  selector: 'app-show-data',
  templateUrl: './show-data.component.html',
  styleUrls: ['./show-data.component.scss']
})
export class ShowDataComponent implements OnInit {
  @Input() showDataOptions;
  tableData;
  deviceId;
  cardUpdation: Subscription;
  isCardLoading = false;
  isDataAvailable = false;
  constants;
  sliderDisabled = false;
  sliderVal;
  sliderDate: string;
  minDate: string;
  maxDate: string;
  IsPrevDisabled = false;
  timestamps = [];
  dates = [];
  times = [];
  headers = [];
  units = [];
  deviceDetails = [];
  sliderOnMove;
  columnCount;
  lodash = _;

  constructor(
    private currentRoute: ActivatedRoute,
    private dashboardService: DashBoardService,
    private deviceDetailsService: DeviceDetailsService,
    private config: AppConfigService,
    private toastr: ToastrService,
    private router: Router,
    private dialogService: NbDialogService
  ) {}

  async ngOnInit() {
    this.constants = this.config.getConstants();
    this.columnCount = this.constants.deviceDetailsColumnCount;
    this.getDeviceId();
    this.initDataUpdation();
  }

  getDeviceId() {
    this.currentRoute.queryParams.subscribe(async params => {
      if (params['deviceId'] && params['deviceId'].match(this.constants.deviceidPattern)) {
        this.deviceId = params['deviceId'];
      } else {
        this.router.navigateByUrl('/pages');
      }
    });
  }

  async initDataUpdation() {
    if (this.showDataOptions && this.showDataOptions.dataEndPoint) {
      try {
        this.isCardLoading = true;
        this.timestamps = await this.getTimestamps(this.deviceId);
        if (this.timestamps && this.timestamps.length) {
          this.setSliderValues();
          if (this.columnCount > this.timestamps.length) {
            this.setDateTimeRowValues(0, this.timestamps.length);
          } else {
            this.setDateTimeRowValues(this.timestamps.length - this.columnCount, this.timestamps.length);
          }

          const response = await this.getData(this.deviceId);
          if (response && response.data) {
            const data = response.data;
            this.headers = response.headers;
            this.units = response.units;
            this.deviceDetails = this.processData(data);
          }
          this.isDataAvailable = Boolean(response.data && Array.isArray(response.data) && response.data.length);
        } else {
          this.isDataAvailable = false;
        }
      } catch (err) {
        this.dashboardService.logError(err);
      } finally {
        this.isCardLoading = false;
      }
    }
  }

  setSliderValues() {
    this.minDate = this.deviceDetailsService.formatDate(this.timestamps[0]);
    this.maxDate = this.deviceDetailsService.formatDate(this.timestamps[this.timestamps.length - 1]);
    this.sliderVal = this.timestamps.length - 1;
    this.sliderDate = this.deviceDetailsService.formatDate(this.maxDate);
    this.sliderDisabled = this.timestamps.length <= this.columnCount;
  }

  setDateTimeRowValues(indexFrom, indexUpto) {
    this.dates = [];
    this.times = [];
    for (let i = indexFrom; i < indexUpto; i++) {
      const date = this.timestamps[i];
      const formattedDate = this.deviceDetailsService.formatDate(date);
      this.dates.push(formattedDate.split(' ')[0]);
      this.times.push(formattedDate.split(' ')[1]);
    }
    this.IsPrevDisabled = this.timestamps.length <= this.columnCount || this.sliderVal <= 0;
  }

  processData(data) {
    let processedData = [];
    let index = 0;
    let length = 0;
    let keys = Object.keys(data[0]);
    const categories = this.showDataOptions.categories;
    categories.forEach(section => {
      let processedObj = {};
      let i;
      processedObj['grpName'] = section.title;
      processedObj['grpData'] = [];
      length += section.parameter.length;
      for (i = 0, index; index < length; index++, i++) {
        let innerObj = {};
        let key = keys[index];
        innerObj['id'] = section.parameter[i];
        innerObj['name'] = this.headers[index];
        innerObj['unit'] = this.units[index];
        innerObj['values'] = [];

        data.forEach(dataSet => {
          if (this.headers[index] === 'Uptime') {
            innerObj['values'].push(this.deviceDetailsService.formatUpTime(dataSet[key]));
          } else if (this.units[index] === '%') {
            if (dataSet[key]) {
              innerObj['values'].push(Number(dataSet[key]).toFixed(2));
            }
          } else {
            innerObj['values'].push(dataSet[key]);
          }
        });
        processedObj['grpData'].push(innerObj);
      }
      processedData.push(processedObj);
    });
    return processedData;
  }

  async afterSliding() {
    this.sliderOnMove = false;
    let length = this.timestamps.length;
    let limit;
    if (this.sliderVal < this.columnCount && length > this.columnCount) {
      limit = length < this.columnCount ? length : this.columnCount;
      this.setDateTimeRowValues(0, limit);
    } else if (this.sliderVal === length) {
      const newTimestamps = await this.getTimestamps(this.deviceId);
      if (newTimestamps[newTimestamps.length - 1] === this.timestamps[length - 1]) {
        this.toastr.info('Currently showing latest data');
        if (this.sliderVal >= length) {
          this.sliderVal = length - 1;
        }
      } else {
        this.timestamps = newTimestamps;
        length = this.timestamps.length;
        limit = length < this.columnCount ? length : this.columnCount;
        this.setSliderValues();
        this.setDateTimeRowValues(length - limit, length);
      }
    } else {
      this.setDateTimeRowValues(this.sliderVal - this.columnCount + 1, this.sliderVal + 1);
    }
    const response = await this.getData(this.deviceId);
    this.deviceDetails = this.processData(response.data);
  }

  onSlide() {
    this.sliderOnMove = true;
    this.sliderDate = this.timestamps[this.sliderVal];
  }

  previous() {
    if (this.sliderVal > 0) {
      this.sliderVal--;
    }
    this.IsPrevDisabled = this.sliderVal <= 0;
    this.afterSliding();
  }

  next() {
    const length = this.timestamps.length;
    if (this.sliderVal < length) {
      this.sliderVal++;
    }
    this.afterSliding();
  }

  getData(deviceId) {
    const parameter = [];
    const length = this.timestamps.length;
    const limit = length <= this.columnCount ? length - 1 : this.columnCount - 1;
    const startIndex = this.sliderVal <= limit ? 0 : this.sliderVal - limit;
    const endIndex = this.sliderVal < limit ? limit : this.sliderVal;
    const start = this.timestamps[startIndex];
    const end = this.timestamps[endIndex];
    const startTime = moment.utc(start).toISOString();
    const endTime = moment.utc(end).toISOString();
    this.showDataOptions.categories.forEach(section => {
      section.parameter.forEach(element => {
        parameter.push(element);
      });
    });
    let params = {
      parameter,
      deviceId,
      startTime,
      endTime
    };
    return this.dashboardService.getDashBoardData(this.showDataOptions.dataEndPoint, params);
  }

  getTimestamps(deviceId) {
    return this.dashboardService.getDashBoardData(this.showDataOptions.timestampDataEndPoint, { deviceId });
  }

  openParameterModal(id, name, data) {
    const colsAndKeys = this.showDataOptions.paramConfig[id]
      ? this.showDataOptions.paramConfig[id]
      : this.showDataOptions.paramConfig.DEFAULT;
    this.dialogService.open(CustomDialogComponent, {
      closeOnEsc: true,
      closeOnBackdropClick: true,
      context: {
        id: `${id.toLowerCase()}_dialog`,
        name,
        data,
        ...colsAndKeys
      }
    });
  }

  ngOnDestroy() {
    if (this.cardUpdation) {
      this.cardUpdation.unsubscribe();
    }
  }
}
