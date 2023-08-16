import { Injectable } from '@angular/core';
import { RestClientService } from '@app/shared/services/restclient/rest-client.service';
import { environment } from '@environment/environment';

@Injectable()
export class FooterService {
  dataServerURL: string;

  constructor(private restClient: RestClientService) {
    this.dataServerURL = '';
  }

  getAppVersion(dataURL: any, parameter?: any) {
    const dataServerEndpoint = this.dataServerURL;
    const url = dataServerEndpoint + dataURL;
    return this.restClient.get(url, parameter);
  }
}
