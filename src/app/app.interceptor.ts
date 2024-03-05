import {
  HttpRequest,
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { CustomHttpParams } from "./common.service";

@Injectable({
  providedIn: "root",
})
export class AppInterceptor implements HttpInterceptor {
  public requestCount = 0;
  constructor(private spinner: NgxSpinnerService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!(req.params instanceof CustomHttpParams && !req.params.loader)) {
      if (this.requestCount < 0) {
        this.requestCount = 0;
      }
      this.requestCount += 1;
      if (
        req.url.includes("api/booking") ||
        req.url.includes("api/order/ordersById") ||
        req.url.includes("api/bb-booking/location")
      ) {
      } else {
        this.spinner.show();
      }
    }
    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.onEnd();
          } else if (event instanceof HttpErrorResponse) {
            this.onEnd();
          }
        },
        (err: any) => {
          this.onEnd();
        }
      ),
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status == 401) {
          }
        }
        return throwError(err);
      })
    );
  }
  private onEnd(): void {
    this.requestCount -= 1;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.spinner.hide();
    }
  }
}
