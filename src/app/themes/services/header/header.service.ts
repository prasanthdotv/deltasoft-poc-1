import { Injectable } from '@angular/core';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { Header } from '@app/themes/config/header';

@Injectable()
export class HeaderService {
  headerConfig = null;
  constructor(private dashboardService: DashBoardService) { }

  getHeaderConfig() {
    if (!this.headerConfig) {
      this.headerConfig = new Header().header;
    }
    return this.headerConfig;
  }
  getLastConsolidatedDate(options?) {
    return this.dashboardService.getDashBoardData('/device-stat/last-date', options, true);
  }
}
