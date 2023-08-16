import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import { LoggerType } from '@app/shared/types/logger-types.enum';
import { HttpOptions } from '@app/shared/types/http-options.interface';
import { ServerResponse } from '@app/shared/types/server-response.interface';

@Injectable()
export class RestClientService {
  constructor(private http: HttpClient, private logger: LoggerService) { }
  post(url: string, body: any = {}, options?) {
    return this.request('POST', url, body, options);
  }
  put(url: string, body: any = {}) {
    return this.request('PUT', url, body);
  }

  get(url: string, queryParam?: any, options?) {
    return this.request('GET', url, queryParam, options);
  }

  private request(method: string, url: string, data: any, options?: HttpOptions): Observable<ServerResponse> {
    let body: any = null;
    let queryParams;
    if (method.toUpperCase() === 'GET') {
      queryParams = { params: data };
    } else {
      body = data;
    }
    const requestOption: HttpOptions = {
      body,
      headers: options ? options.headers : null,
      observe: options ? options.observe : null,
      params: queryParams ? queryParams.params : null,
      responseType: options ? options.responseType : null,
      reportProgress: options ? options.reportProgress : null,
      withCredentials: options ? options.withCredentials : null
    };
    return this.http.request<ServerResponse>(method, url, requestOption).pipe(catchError(this.handleError('RestRequest')));
  }

  private handleError(operation: string) {
    return (err: any) => {
      if (err instanceof HttpErrorResponse) {
        this.logger.log(LoggerType.DEBUG, `status: ${err.status}, ${err.statusText}`);
      }
      return throwError(err);
    };
  }

  private getParams(query) {
    if (!query) {
      return null;
    }
    let params: HttpParams = new HttpParams();
    for (const key of Object.keys(query)) {
      if (query[key] || query[key] === 0) {
        if (query[key] instanceof Array) {
          query[key].forEach(item => {
            params = params.append(`${key.toString()}[]`, item);
          });
        } else {
          params = params.append(key.toString(), query[key]);
        }
      }
    }
    return params;
  }
}
