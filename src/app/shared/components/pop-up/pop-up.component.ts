import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { DashBoardService } from '@app/core/services/dashboard/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService } from '@app/shared/services/filter/filter.service';
import { DataUpdateService } from '@app/core/services/update-data/data-updation.service';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss']
})
export class PopUpComponent implements OnInit {
  isDataListLoading: false;
  data: any;
  boxData: any;
  cols = [];
  keys = [];
  header = 'Device Details';
  totalRecords: number;
  isTableLoaded: boolean;
  tableRowCount = 15;
  errorMessage: string;
  currentTimeStamp: any;
  isDataLoaded: boolean;
  tooltip = null;
  constructor(
    protected ref: NbDialogRef<PopUpComponent>,
    private dashBoard: DashBoardService,
    private toastr: ToastrService,
    private changeRef: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private filterService: FilterService,
    private dataUpdateService: DataUpdateService
  ) {}

  cancel() {
    this.ref.close();
  }

  async ngOnInit() {
    this.isTableLoaded = true;
    this.isDataLoaded = true;
    this.currentTimeStamp = moment
      .utc(this.boxData.dateUpto)
      .local()
      .format('YYYY-MM-DD HH:mm:ss');
    this.data = [];
    await this.getDrillDownData(0);
    if (this.data && this.data[0]) {
      this.keys = Object.keys(this.data[0]);
    }
  }
  async getDrillDownData(index) {
    try {
      const filterParams = this.filterService.getAppliedFilters();
      const commonParams = this.getCommonParams();
      const params = {
        limit: this.tableRowCount,
        offset: index,
        ...commonParams,
        ...filterParams
      };
      const response = await this.dashBoard.getDrillDownData(params);
      if (response.isSuccess) {
        const drillDownResponse = response.data;
        this.cols = drillDownResponse.header;
        if (drillDownResponse && drillDownResponse.length > 0) {
          this.data = drillDownResponse.values;
          this.totalRecords = drillDownResponse.length;
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.errorMessage = 'Data for the specified timestamp does not exist';
        }
      } else {
        this.data = [];
        this.totalRecords = 0;
        this.errorMessage = 'No data available';
      }
      this.isDataLoaded = false;
    } catch (err) {
      this.isDataLoaded = false;
      this.toastr.error('Something went wrong', 'Error');
      this.cancel();
    }
  }

  async loadData(event) {
    this.isTableLoaded = true;
    this.changeRef.detectChanges();
    await this.getDrillDownData(event.first);
    this.isTableLoaded = false;
  }

  async refreshDeviceDetails() {
    try {
      this.isDataLoaded = true;
      await this.getDrillDownData(0);
      if (this.data && this.data[0]) {
        this.keys = Object.keys(this.data[0]);
      }
    } catch (err) {
      this.dashBoard.logError(err);
      return;
    }
  }

  async openDeviceDetails(row: any) {
    const queryParams = `deviceId=${row['deviceid']}`;
    window.open('#/pages/device/basic?' + queryParams, '_blank');
  }

  async downloadCsv() {
    const filterParams = this.filterService.getAppliedFilters();
    const commonParams = this.getCommonParams();
    const options = {
      ...filterParams,
      ...commonParams
    };
    try {
      this.spinner.show();
      let csvResponse;
      if (this.boxData.csvEndPoint) {
        csvResponse = await this.dashBoard.downloadCsvData(options, this.boxData.csvEndPoint);
      } else {
        csvResponse = await this.dashBoard.downloadCsvData(options);
      }
      const blob = new Blob([csvResponse.data], { type: 'text/csv' });
      FileSaver.saveAs(blob, 'csvData.csv');
    } catch (error) {
      this.toastr.error('Something went wrong', 'Error');
    } finally {
      this.spinner.hide();
    }
  }
  getCommonParams() {
    const tzOffset = this.dataUpdateService.getTimezoneOffset();
    let options = {
      tzOffset,
      parameter: this.boxData.exportParameter ? this.boxData.exportParameter : this.boxData.parameter,
      status: this.boxData.status,
      dateFrom: this.boxData.dateFrom,
      dateUpto: this.boxData.dateUpto
    };
    return options;
  }
}
