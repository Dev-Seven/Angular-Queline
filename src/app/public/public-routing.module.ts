import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PublicComponent } from "./public.component";
import { ReserveSpotComponent } from "./reserve-spot/reserve-spot.component";
import { SignupComponent } from "./signup/signup.component";
//import { VerifyComponent } from './verify/verify.component';
import { WaitListComponent } from "./wait-list/wait-list.component";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { UnauthorizedComponent } from "./unauthorized/unauthorized.component";
import { FeedbackComponent } from "./feedback/feedback.component";
import { ChatdashboardComponent } from "./chatdashboard/chatdashboard.component";
import { ForgotComponent } from "./forgot/forgot.component";
import { ForgotPasswordComponent } from "./forgotpassword/forgotpassword.component";
import { EndUserSignupComponent } from "./end_user_signup/end_user_signup.component";
import { SelectModeComponent } from "./select-mode/select-mode.component";
import { BookingComponent } from "./booking/booking.component";
import { BookingWaitlistComponent } from "./booking-waitlist/booking-waitlist.component";
import { LtPlanComponent } from "./lt-plan/lt-plan.component";
//routes
const routes: Routes = [
  {
    path: "",
    component: PublicComponent,
    children: [
      { path: "", redirectTo: "login", pathMatch: "full" },
      { path: "login", component: LoginComponent },
      { path: "signup", component: SignupComponent },
      { path: "signup/lt-plan", component: LtPlanComponent },

      {
        path: "user/signup/:locationId/:partySize/:email/:phone",
        component: EndUserSignupComponent,
      },
      {
        path: "user/update/:locationId/:partySize/:userId",
        component: EndUserSignupComponent,
      },
      { path: "forgot", component: ForgotComponent },
      { path: "forgot/:verify", component: ForgotComponent },
      { path: "forgotpassword/:email", component: ForgotPasswordComponent },
      { path: "reservespot", component: ReserveSpotComponent },
      { path: "selectmode", component: SelectModeComponent },
      { path: "selectmode/:locationId", component: SelectModeComponent },
      {
        path: "checkin/:location/:locationName/:locationId",
        component: ReserveSpotComponent,
      },
      { path: "reservespot/:locationId", component: ReserveSpotComponent },
      { path: "booking/:locationId", component: BookingComponent },
      {
        path: "reservespot/:locationId/:partySize/:userId",
        component: ReserveSpotComponent,
      },
      { path: "waitlist/:locationId", component: WaitListComponent },
      { path: "waitlist/:id/:locationId", component: WaitListComponent },
      {
        path: "booking-waitlist/:locationId",
        component: BookingWaitlistComponent,
      },
      {
        path: "booking-waitlist/:id/:locationId",
        component: BookingWaitlistComponent,
      },
      { path: "unauthorized", component: UnauthorizedComponent },
      { path: "chatdashboard", component: ChatdashboardComponent },
      { path: "logout", component: LogoutComponent },
      { path: "feedback/:id", component: FeedbackComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class PublicRoutingModule {}

export const PublicComponents = [
  LtPlanComponent,
  PublicComponent,
  SignupComponent,
  ReserveSpotComponent,
  WaitListComponent,
  LoginComponent,
  LogoutComponent,
  UnauthorizedComponent,
  FeedbackComponent,
  ChatdashboardComponent,
  ForgotComponent,
  ForgotPasswordComponent,
  EndUserSignupComponent,
  SelectModeComponent,
  BookingComponent,
  BookingWaitlistComponent,
];
