import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbThemeService } from '@nebular/theme';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { CustomThemeService } from '@app/themes/services/custom-theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'confirmation-pop-up',
  templateUrl: './confirmation-pop-up.component.html',
  styleUrls: ['./confirmation-pop-up.component.scss']
})
export class ConfirmationPopUp implements OnInit {
  id: any;
  header: any;
  content: any;
  okBtnTxt: any;
  otherOptions: any;
  constants: any;
  theme: any;
  themeSubscription: Subscription;
  constructor(
    protected ref: NbDialogRef<ConfirmationPopUp>,
    private config: AppConfigService,
    private customTheme: CustomThemeService,
    private themeService: NbThemeService
  ) {}

  async ngOnInit() {
    this.initThemeOptions();
  }

  initThemeOptions() {
    this.constants = this.config.getConstants();
    const theme = this.themeService.currentTheme;
    if (theme) {
      this.theme = theme === this.constants.darkTheme ? 'dark' : 'light';
    } else {
      this.theme = this.constants.defaultTheme === this.constants.darkTheme ? 'dark' : 'light';
    }
    this.themeSubscription = this.customTheme.themeChanged$.subscribe(value => {
      this.theme = value === this.constants.darkTheme ? 'dark' : 'light';
    });
  }

  cancel(status) {
    this.ref.close(status);
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
