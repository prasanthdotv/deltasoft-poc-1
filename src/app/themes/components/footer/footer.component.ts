import { Component, OnInit } from '@angular/core';
import { FooterService } from '@app/themes/services/footer/footer.service';
import { LoggerService } from '@app/shared/services/logger/logger.service';
import { LoggerType } from '@app/shared/types/logger-types.enum';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  appVersion = '';
  copyrightYear = '';
  constants;

  constructor(private footerService: FooterService, private loggerService: LoggerService, private appConfig: AppConfigService) { }

  ngOnInit() {
   this.constants = this.appConfig.getConstants();
    this.getAppVersion();
    this.getCopyRightYear();
  }

  getAppVersion() {
    this.footerService.getAppVersion('/app/version').subscribe((response) => {
      if (response && response.isSuccess) {
        this.appVersion = response.data.version;
      }
    }, error => {
      this.loggerService.log(LoggerType.ERROR, `status: ${error.status}, ${error.statusText}`);
    });
  }

  getCopyRightYear() {
    const copyrightStartYear = this.constants.copyrightStartYear;
    const copyRightEndYear = new Date().getFullYear();
    this.copyrightYear = `${copyrightStartYear}${
      copyrightStartYear === copyRightEndYear ? '' : '-' + copyRightEndYear
    }`;
  }

}
