import { Injectable } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { SidebarService } from '@app/themes/services/sidebar/sidebar.service';

@Injectable()
export class DashboardPagesService {
  constructor(private configService: AppConfigService, private sidebarService: SidebarService) {}

  generateTimeRange(timeRange) {
    const timeRangeList = [];
    timeRange.forEach(slot => {
      const slotValue: any = {};
      if (slot == 'custom') {
        slotValue.label = 'Custom';
        slotValue.value = 0;
      } else if (slot >= 24) {
        const label = slot / 24;
        slotValue.label = label > 1 ? label + ' days' : label + ' day';
        slotValue.value = slot;
      } else {
        slotValue.label = slot + ' hour';
        slotValue.value = slot;
      }
      timeRangeList.push(slotValue);
    });
    return timeRangeList;
  }

  generateRefreshTimeSlots(timeRange) {
    const refreshSlots = [];
    timeRange.forEach(slot => {
      const slotContent: any = {};
      if (slot) {
        slotContent.label = slot >= 60 ? slot / 60 + 'm' : slot + 's';
        slotContent.value = slot;
      } else {
        slotContent.label = 'Off';
        slotContent.value = 0;
      }
      refreshSlots.push(slotContent);
    });
    return refreshSlots;
  }

  getPageContent(routeData) {
    const routerPath = routeData[0].path;
    const pageConfiguration = this.configService.getDashboardContent();
    const pageContent = pageConfiguration.find(pageObject => {
      return pageObject.page_id === 'information';
    });
    return pageContent;
  }

  getTimeout(hour, minute) {
    const date = new Date();
    const currentTime = date.getTime();
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);
    date.setMilliseconds(0);
    let targetTime = date.getTime();
    if (currentTime < targetTime) {
      return targetTime - currentTime;
    } else {
      date.setDate(date.getDate() + 1);
      targetTime = date.getTime();
      return targetTime - currentTime;
    }
  }

  calculateTimeSlot(dates: any[]) {
    const dateFrom = new Date(dates[0]);
    const dateUpto = new Date(dates[1]);
    const millisec = dateUpto.getTime() - dateFrom.getTime();
    const timeSlot = (millisec / (1000 * 60 * 60)).toFixed(1);
    return timeSlot;
  }
}
