import { DashBoardService } from './../../../core/services/dashboard/dashboard.service';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import * as moment from 'moment';

@Injectable()
export class DeviceDetailsService {
  constructor(private configService: AppConfigService, private dashboardService: DashBoardService) {}

  getPageContent(routeData) {
    const routerPath = routeData[1].path;
    const pageConfiguration = this.configService.getDashboardContent();
    const pageContent = pageConfiguration.find(pageObject => {
      return pageObject.page_id === routerPath;
    });
    return pageContent;
  }

  setDateStartingTime(selectedDate) {
    let date = new Date(selectedDate);
    return moment(date).format('yyyy-MM-DD 00:00:00');
  }

  setDateEndingTime(selectedDate) {
    let date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    return moment(date).format('yyyy-MM-DD 00:00:00');
  }

  getDeviceId(deviceId) {
    return this.dashboardService.getDashBoardData('/device/info', {
      deviceId
    });
  }
  formatUpTime(time) {
    let days = Math.floor(time / (24 * 60 * 60));
    let hours = Math.floor((time - days * 24 * 60 * 60) / (60 * 60));
    let minutes = Math.floor((time - hours * 60 * 60 - days * 24 * 60 * 60) / 60);
    if (days > 0) {
      return days + 'd:' + hours + 'h:' + minutes + 'm';
    } else if (days <= 0 && hours > 0) {
      return hours + 'h:' + minutes + 'm';
    } else {
      return minutes + 'm';
    }
  }

  formatMemoryParams(val, unit) {
    let formatedVal;
    if (unit === 'KB') {
      if (val < 1000) {
        formatedVal = val + ' KB';
      } else if (val >= 1000 && val < 1000 * 1000) {
        formatedVal = (Number(val) / 1000).toFixed(2) + 'MB';
      } else {
        formatedVal = (Number(val) / (1000 * 1000)).toFixed(1) + 'GB';
      }
    } else if (unit === 'MB') {
      if (val < 1000) {
        formatedVal = Number(val).toFixed(2) + ' MB';
      } else {
        formatedVal = (Number(val) / 1000).toFixed(1) + 'GB';
      }
    }
    return formatedVal;
  }

  formatDate(date) {
    return moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
  }
}
