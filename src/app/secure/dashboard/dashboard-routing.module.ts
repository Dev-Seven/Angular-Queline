import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app-core";
import { ActivityMapComponent } from "./activity_map/activity_map.component";
import { BookingInfoComponent } from "./booking_info/booking_info.component";
import { DashboardComponent } from "./dashboard.component";
import { FeedbackComponent } from "./feedback/feedback.component";
import { ReserveSpotComponent } from "./reserve-spot/reserve-spot.component";
import { BbBookingComponent } from "./bb-booking/bb-booking.component";
//routes
const routes: Routes = [
  {
    path: "",
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

export const DashboardComponents = [
  DashboardComponent,
  FeedbackComponent,
  ReserveSpotComponent,
  BookingInfoComponent,
  BbBookingComponent,
  ActivityMapComponent,
];
