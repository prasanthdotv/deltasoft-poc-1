import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@environment/environment';
import { RestClientService } from '@app/shared/services/restclient/rest-client.service';
import { LoggerType } from '@app/shared/types/logger-types.enum';
import { LoggerService } from '@app/shared/services/logger/logger.service';

@Injectable()
export class DashBoardService {
  constructor(private restClient: RestClientService, private loggerService: LoggerService) {
    this.dataServerURL = '';
  }

  dataServerURL: string;

  async getDashBoardData(dataURL: any, parameter?: any, postReq?) {
    try {
      let response;
      const dataServerEndpoint = this.dataServerURL;
      const url = dataServerEndpoint + dataURL;
      if (postReq) {
        response = await this.restClient.post(url, parameter).toPromise();
      } else {
        response = await this.restClient.get(url, parameter).toPromise();
      }
      if (response.isSuccess && response.data) {
        return response.data;
      }
    } catch (error) {
      this.logError(error);
    }
  }

  async updateDashBoardData(dataURL: any, parameter?: any) {
    try {
      const dataServerEndpoint = this.dataServerURL;
      const url = dataServerEndpoint + dataURL;
      const response = await this.restClient.put(url, parameter).toPromise();
      return response.isSuccess;
    } catch (error) {
      this.logError(error);
    }
  }

  async getLatestTimeStamp() {
    try {
      const dataServerEndpoint = this.dataServerURL;
      const url = dataServerEndpoint + '/live-data/getLatestTimeStamp';
      const response = await this.restClient.get(url).toPromise();
      if (response.isSuccess && response.data) {
        return response.data;
      }
    } catch (error) {
      this.logError(error);
    }
  }

  async getDrillDownData(params, endPoint?) {
    try {
      const dataServerEndpoint = this.dataServerURL;
      const url = endPoint
        ? dataServerEndpoint + endPoint
        : dataServerEndpoint + '/live-data/drilldown-data';
      return await this.restClient.post(url, params).toPromise();
    } catch (error) {
      this.logError(error);
      return error;
    }
  }

  async downloadCsvData(params, endPoint?) {
    const dataServerEndpoint = this.dataServerURL;
    let url;
    if (endPoint) {
      url = dataServerEndpoint + endPoint;
    } else {
      url = dataServerEndpoint + '/live-data/csv-data';
    }
    return this.restClient.post(url, params).toPromise();
  }

  logError(error) {
    if (error instanceof HttpErrorResponse) {
      return;
    }
    this.loggerService.log(LoggerType.ERROR, `${error}`);
  }
}
