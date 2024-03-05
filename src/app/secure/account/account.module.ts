import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { AccountService } from "./account.service";
import {
  AccountRoutingModule,
  AccountComponents,
} from "./account-routing.module";
import { MaterialModule } from "src/app/material-module";
import { SharedModule } from "@app-shared";
import { NgxQRCodeModule } from "@techiediaries/ngx-qrcode";
import { ProfileService } from "../profile/profile.service";
import { ProfileModule } from "../profile/profile.module";
import { CustomerInfoComponent } from "./customer_info/customer_info.component";
import { EditDefaultCustomerInfoComponent } from "./edit_default_customer_info/edit_default_customer_info.component";
import { EditCustomerInfoComponent } from "./edit_customer_info/edit_customer_info.component";
import { EditUserComponent } from "./edit_user/edit_user.component";
import { BsModalService, ModalModule } from "ngx-bootstrap/modal";
import { OpeningInfoComponent } from "./opening_info/opening_info.component";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { BookingHoursComponent } from "./booking-hours/booking-hours.component";
import { PublicService } from "src/app/public/public.service";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { DailogexampleComponent } from "../dailogexample/dailogexample.component";

@NgModule({
  declarations: [[...AccountComponents]],
  imports: [
    AccountRoutingModule,
    MaterialModule,
    SharedModule,
    NgxQRCodeModule,
    ProfileModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  providers: [AccountService, ProfileService, PublicService, BsModalService],
  entryComponents: [
    CustomerInfoComponent,
    EditDefaultCustomerInfoComponent,
    EditCustomerInfoComponent,
    EditUserComponent,
    OpeningInfoComponent,
    BookingHoursComponent,
    DailogexampleComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountModule {}
