import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { AppConfigService } from './core/services/app-config/app-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  appConstants: any;
  gaTrackingId: string;
  constructor(
    private appConfig: AppConfigService,
    private themeService: NbThemeService,
    public router: Router
  ) {}
  ngOnInit(): void {
    this.appConstants = this.appConfig.getConstants();
    this.applyTheme();
  }

  applyTheme(): void {
    this.themeService.changeTheme('icx-dark-theme');
  }
}
