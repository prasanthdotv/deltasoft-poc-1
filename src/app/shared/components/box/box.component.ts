import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';
import { Subscription } from 'rxjs';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { ToastrService } from 'ngx-toastr';
import { NbDialogService } from '@nebular/theme';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit, OnDestroy {
  @Input() boxProperty: any;
  @Input() isBoxLoading: boolean;
  @Input() isDataEmpty: any;
  chartUpdation: Subscription;
  // Included for selenium testing
  inputId: any;
  last15MinData: any;
  titleString: any;
  constants: any;

  constructor(
    private dashBoard: DashBoardService,
    private dataUpdateService: DataUpdateService,
    private filterService: FilterService,
    private toastr: ToastrService,
    private dialogService: NbDialogService,
    private config: AppConfigService
  ) { }

  async ngOnInit() {
    this.storeBoxIDForTesting();
    this.setTitle();
    this.initBoxDataUpdation();
  }

  storeBoxIDForTesting() {
    //Used for single box only
    if (this.boxProperty && this.boxProperty.dataEndPoint) {
      if (this.boxProperty.id) {
        this.inputId = this.boxProperty.id;
      }
    }
  }
  setTitle(timeInfo?) {
    this.titleString = this.dataUpdateService.titleCreator(this.boxProperty, timeInfo);
  }
  initBoxDataUpdation() {
    let boxData: any;
    this.constants = this.config.getConstants();
    if (this.boxProperty && this.boxProperty.dataEndPoint) {
      this.chartUpdation = this.dataUpdateService.updateLiveData$.subscribe(async event => {
        if (event && !this.constants.refreshEvents.includes(event)) {
          this.setTitle();
        }
        try {
          this.isBoxLoading = true;
          boxData = await this.getBoxData();
          this.isBoxLoading = false;
          this.boxProperty.label = boxData.data ? boxData.data : 0;
          if (this.boxProperty.unit === 'count') {
            this.boxProperty.label = Math.round(this.boxProperty.label);
          }
        } catch (err) {
          this.dashBoard.logError(err);
        } finally {
          this.isBoxLoading = false;
        }
      });
    }
  }

  getBoxData() {
    if (!this.boxProperty.dataEndPoint) {
      return;
    } else {
      const filterParams = this.filterService.getAppliedFilters();
      let params = {
        ...filterParams
      };
      if (this.boxProperty.parameter) {
        params['parameter'] = this.boxProperty.parameter;
      }
      return this.dashBoard.getDashBoardData(this.boxProperty.dataEndPoint, params, this.boxProperty.isPostReq);
    }
  }
  openDrillDown() {
    try {
      if (this.boxProperty.status && this.boxProperty.label && this.boxProperty.label > 0) {
        this.dialogService.open(PopUpComponent, {
          context: {
            boxData: this.boxProperty
          }
        });
      }
    } catch (error) {
      this.toastr.error('Something went wrong', 'Error');
    }
  }

  ngOnDestroy() {
    if (this.chartUpdation) {
      this.chartUpdation.unsubscribe();
    }
  }
}
