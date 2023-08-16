import { Injectable } from '@angular/core';
import { AppConfig } from '@app/core/config/app-config';

@Injectable()
export class AppConfigService {
  appConfig: any;

  constructor() {}

  getAppConfig() {
    this.appConfig = new AppConfig().config;
    return this.appConfig;
  }

  getDashboardContent() {
    return this.appConfig.pages;
  }

  getConstants() {
    return this.appConfig.constants;
  }
}
