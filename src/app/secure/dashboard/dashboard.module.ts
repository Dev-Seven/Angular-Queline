import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule, PartySizeModalComponent } from "@app-shared";
import { UserAuthService } from "@app-core";
import {
  DashboardComponents,
  DashboardRoutingModule,
} from "./dashboard-routing.module";
import { ChartistModule } from "ng-chartist";
import { NgxQRCodeModule } from "@techiediaries/ngx-qrcode";
import { ChartsModule } from "ng2-charts";
import { NgSelectModule } from "@ng-select/ng-select";
import { ProfileService } from "../profile/profile.service";
import { AccountService } from "../account/account.service";
import { DashboardService } from "./dashboard.service";
import { PublicService } from "src/app/public/public.service";
import { FeedbackComponent } from "./feedback/feedback.component";
import { ReserveSpotComponent } from "./reserve-spot/reserve-spot.component";
import { BsModalService, ModalModule } from "ngx-bootstrap/modal";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { BookingInfoComponent } from "./booking_info/booking_info.component";
import { ActivityMapComponent } from "./activity_map/activity_map.component";
import { GoogleMapsModule } from "@angular/google-maps";
import { Ng2TelInputModule } from "ng2-tel-input";
import { NgxPaginationModule } from "ngx-pagination";
import { BbBookingComponent } from "./bb-booking/bb-booking.component";

@NgModule({
  declarations: [[...DashboardComponents]],
  imports: [
    DashboardRoutingModule,
    SharedModule,
    ChartistModule,
    NgxQRCodeModule,
    ChartsModule,
    NgSelectModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    GoogleMapsModule,
    Ng2TelInputModule,
    NgxPaginationModule,
  ],
  providers: [
    UserAuthService,
    DashboardService,
    ProfileService,
    AccountService,
    PublicService,
    BsModalService,
  ],
  entryComponents: [
    PartySizeModalComponent,
    FeedbackComponent,
    ReserveSpotComponent,
    BbBookingComponent,
    BookingInfoComponent,
    ActivityMapComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardModule {}
