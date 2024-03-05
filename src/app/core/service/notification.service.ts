import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class NotificationService {
  constructor(private toastrService: ToastrService) {}

  success(message: string, title: string = "", config: Object = {}) {
    this.toastrService.success(message, title, config);
  }

  error(message: string, title?: string, config?: Object) {
    this.toastrService.error(message, title, config);
  }

  info(message: string, title: string = "", config: Object = {}) {
    this.toastrService.info(message, title, config);
  }

  warning(message: string, title?: string, config: Object = {}) {
    this.toastrService.warning(message, title, config);
  }
}
