import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent implements OnInit {
  id: any;
  data: any;
  name: any;
  boxData: any;
  cols: any;
  keys: any;
  totalRecords: number;
  tableRowCount = 6;
  isDataLoaded: boolean;
  errorMessage: any;
  constructor(
    protected ref: NbDialogRef<CustomDialogComponent>,
    private toastr: ToastrService
  ) {}

  cancel() {
    this.ref.close();
  }

  async ngOnInit() {
    this.isDataLoaded = true;
    this.initTable();
  }

  async initTable() {
    try {
      if (this.data && this.data.length) {
        this.totalRecords = this.data.length;
      } else {
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
}
