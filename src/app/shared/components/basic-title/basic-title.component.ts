import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-basic-title',
  templateUrl: './basic-title.component.html',
  styleUrls: ['./basic-title.component.scss']
})
export class BasicTitleComponent implements OnInit, OnDestroy {
  @Input() property: any;
  chartUpdation: Subscription;
  titleString: any;
  constants: any;

  constructor(private dataUpdateService: DataUpdateService, private config: AppConfigService) { }

  async ngOnInit() {
    this.setTitle();
    this.initBoxDataUpdation();
  }
  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.property, timeInfo);
  }
  initBoxDataUpdation() {
    this.constants = this.config.getConstants();
    if (this.property && this.property.durationRequired) {
      this.chartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
        if (event && !this.constants.refreshEvents.includes(event)) {
          this.setTitle();
        }
      });
    }
  }
  ngOnDestroy() {
    if (this.chartUpdation) {
      this.chartUpdation.unsubscribe();
    }
  }
}
