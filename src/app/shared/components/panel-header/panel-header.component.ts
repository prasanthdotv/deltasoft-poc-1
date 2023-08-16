import { Component, OnInit, Input } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import * as FileSaver from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';

@Component({
  selector: 'app-panel-header',
  templateUrl: './panel-header.component.html',
  styleUrls: ['./panel-header.component.scss']
})
export class PanelHeaderComponent implements OnInit {
  @Input() boxData: any;
  @Input() isDataEmpty: any;

  constructor(
    private dashBoard: DashBoardService,
    private dialogService: NbDialogService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private filterService: FilterService,
    private dataUpdateService: DataUpdateService
  ) {}

  async ngOnInit() {}

  async onViewClick(e, context) {
    try {
      this.dialogService.open(PopUpComponent, {
        context: {
          boxData: this.boxData
        }
      });
    } catch (error) {
      this.toastr.error('Something went wrong', 'Error');
    }
  }
  async onDownloadClick(e, context) {
    const tzOffset = this.dataUpdateService.getTimezoneOffset();
    const filterParams = this.filterService.getAppliedFilters();
    const params = {
      parameter: this.boxData.exportParameter ? this.boxData.exportParameter : this.boxData.parameter,
      status: this.boxData.status,
      dateFrom: this.boxData.dateFrom,
      dateUpto: this.boxData.dateUpto,
      tzOffset: tzOffset,
      ...filterParams
    };
    try {
      this.spinner.show();
      let csvResponse;
      if (this.boxData.csvEndPoint) {
        csvResponse = await this.dashBoard.downloadCsvData(params, this.boxData.csvEndPoint);
      } else {
        csvResponse = await this.dashBoard.downloadCsvData(params);
      }
      const blob = new Blob([csvResponse.data], { type: 'text/csv' });
      FileSaver.saveAs(blob, 'csvData.csv');
    } catch (error) {
      this.toastr.error('Something went wrong', 'Error');
    } finally {
      this.spinner.hide();
    }
  }

  getMenuItemsForItem(item) {
    const context = item;
    return [
      {
        label: 'View Details',
        icon: 'pi pi-fw pi-table',
        command: e => this.onViewClick(e, context)
      },
      {
        label: 'Download',
        icon: 'pi pi-fw pi-download',
        command: e => this.onDownloadClick(e, context)
      }
    ];
  }
}
