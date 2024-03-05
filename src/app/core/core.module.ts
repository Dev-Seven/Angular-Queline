import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { EventService } from "./event";
import {
  UserAuthService,
  BaseService,
  ListService,
  AccountService,
  NotificationService,
  DocumentService,
} from "./service";

import { AuthGuard } from "./guards";

@NgModule({
  imports: [HttpClientModule],
  providers: [
    EventService,
    UserAuthService,
    BaseService,
    ListService,
    DocumentService,
    AccountService,
    AuthGuard,
    NotificationService,
  ],
})
export class CoreModule {}
