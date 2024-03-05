import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { NotificationService } from "./notification.service";

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(
        (evt) => {
          if (evt instanceof HttpRequest) {
          }
        },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              window.localStorage.clear();
              if (err.url.indexOf("admin/signin") > -1) {
                // not routing to unauthorized for login page
              } else {
                this.router.navigate(["unauthorized"]);
              }
            } else if (err.status === 500) {
              if (
                err.error.message.indexOf("ER_DUP_ENTRY") >= -1 &&
                err.url.indexOf("admin/signup") >= -1
              ) {
              } else {
                this.notificationService.error(
                  "Something went wrong.",
                  "Error"
                );
              }
            } else if (err.status === 0) {
              this.notificationService.error("Internet Issue.", "Error");
            }
          }
        }
      )
    );
  }
}
