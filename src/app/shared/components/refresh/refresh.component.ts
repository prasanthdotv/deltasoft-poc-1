import { Component, OnInit, Input } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { DashboardPagesService } from '@app/pages/services/dashboard-pages/dashboard-pages.service';

@Component({
  selector: 'refresh',
  templateUrl: './refresh.component.html',
  styleUrls: ['./refresh.component.scss']
})
export class RefreshComponent implements OnInit {
  @Input() isAutoRefreshNeeded: boolean;
  @Input() filterChangeEvent: boolean;
  constants: any;
  selectedRefreshTime: number;
  refreshTimeInterval: any[];

  constructor(
    private dataUpdateService: DataUpdateService,
    private config: AppConfigService,
    private dashboardPageService: DashboardPagesService
  ) { }

  ngOnInit() {
    this.initProperties();
  }

  initProperties() {
    this.constants = this.config.getConstants();
    const { refreshTimeInterval } = this.constants;
    this.selectedRefreshTime = this.dataUpdateService.selectedRefreshTime;
    this.refreshTimeInterval = this.dashboardPageService.generateRefreshTimeSlots(refreshTimeInterval);
    this.resetDashboard();
  }
  refreshTimeChanged(event) {
    const newRefreshTime = event;
    this.dataUpdateService.updateRefreshTime(newRefreshTime, this.filterChangeEvent);
  }

  refreshDashboard() {
    this.dataUpdateService.refreshDashboard();
  }
  resetDashboard() {
    this.selectedRefreshTime = this.constants.defaultRefreshTime;
    this.dataUpdateService.updateRefreshTime(this.selectedRefreshTime, this.filterChangeEvent);
  }
}
