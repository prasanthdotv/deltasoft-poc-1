import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CsvURLs } from '@app/shared/config/csv-urls';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let reqClone: HttpRequest<any> = req;
    // let accessToken = this.authService.getAuthorizationToken();
    // if (accessToken) {
    //   reqClone = req.clone({
    //     headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
    //   });
    // }
    return next.handle(reqClone).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 0:
            this.toastr.error('Server Unavailable', 'Error');
            break;
          case 400:
            if (!reqClone.url.includes('/login')) {
              this.toastr.error('Something went wrong', 'Error');
            } else {
              this.toastr.error('Missing Credentials', 'Error');
            }
            break;
          case 401:
            // if (error.error.data == 'jwt expired') {
            //   return this.authService.renewAccessToken().pipe(
            //     flatMap((response: any) => {
            //       const { accessToken, refreshToken } = response.data;
            //       if (response.isSuccess) {
            //         this.authService.setTokens(accessToken, refreshToken);
            //         reqClone = req.clone({
            //           headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
            //         });
            //         return next.handle(reqClone).pipe(
            //           catchError(err => {
            //             return throwError(error);
            //           })
            //         );
            //       } else {
            //         this.reDirectToLoginPage();
            //       }
            //     })
            //   );
            // }
            break;
          case 403:
            this.reDirectToLoginPage();
            break;
          case 404:
            const splittedURL = reqClone.url.split('/');
            const endPoint = splittedURL[splittedURL.length - 1];
            if (CsvURLs.URLs.includes(endPoint)) {
              this.toastr.error('Data Not Available', 'Error');
            } else {
              this.toastr.error('Resource Not Found', 'Error');
            }
            break;
          case 405:
            this.toastr.error('Something went wrong', 'Error');
            break;
          case 406:
            // this.authService.showUserAgreement(reqClone.body);
            break;
          case 500:
            if (reqClone.url.includes('/renew-token')) {
              this.reDirectToLoginPage();
            } else {
              this.toastr.error('Server Error', 'Error');
            }
            break;
          default:
            this.toastr.error('Something went wrong', 'Error');
            break;
        }
        return throwError(error);
      })
    );
  }

  reDirectToLoginPage() {
    this.toastr.error('You are not authorized to view the page', 'Error');
    // this.authService.removeTokens();
    this.router.navigateByUrl('/auth');
  }
}
