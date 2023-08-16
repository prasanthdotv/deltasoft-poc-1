import { AppConfigService } from './../../../core/services/app-config/app-config.service';
import { Injectable } from '@angular/core';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';

@Injectable()
export class ThresholdSettingsService {
  constants;
  constructor(private dashBoard: DashBoardService, private appConfig: AppConfigService) {
    this.constants = this.appConfig.getConstants();
  }
  async getNextConsolidationTime() {
    return this.dashBoard.getDashBoardData('/params/consolidation-time');
  }
  async getParameterData() {
    return this.dashBoard.getDashBoardData('/params/applied');
  }
  async getLatestParameterData() {
    return this.dashBoard.getDashBoardData('/params/latest');
  }
  async discardUpdates() {
    return this.dashBoard.getDashBoardData('/params/discard');
  }
  async updateParameterData(data) {
    return this.dashBoard.updateDashBoardData('/params', data);
  }
}
