import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NotificationService, UserAuthService } from "@app-core";
import { AccountService } from "../account/account.service";
import { ProfileService } from "../profile/profile.service";
import {
  BookingListComponents,
  BookingListRoutingModule,
} from "./booking-list-routing.module";
import { BsModalService, ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [...BookingListComponents],
  imports: [CommonModule, ModalModule.forRoot(), BookingListRoutingModule],
  providers: [
    UserAuthService,
    NotificationService,
    ProfileService,
    AccountService,
    BsModalService,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BookingListModule {}
