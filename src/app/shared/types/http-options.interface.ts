import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface HttpOptions {
  body?: any;
  headers?: HttpHeaders;
  observe?: 'body';
  params?: HttpParams;
  responseType?: 'json';
  reportProgress?: boolean;
  withCredentials?: boolean;
}
