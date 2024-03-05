import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SecureComponent } from "./secure.component";
import { AuthGuard } from "@app-core";
import { FullComponent } from "../layouts/full/full.component";
import { AppHeaderComponent } from "../layouts/full/header/header.component";
import { AppSidebarComponent } from "../layouts/full/sidebar/sidebar.component";
import { PricingComponent } from "./pricing/pricing.component";
import { CustomerchatComponent } from "./customerchat/customerchat.component";
import { ContactusComponent } from "./contactus/contactus.component";
import { LatestspotComponent } from "./latestspot/latestspot.component";
import { InquiryComponent } from "./inquiry/inquiry.component";
import { BookingListComponent } from "./booking-list/booking-list.component";
import { LocationadminsComponent } from "./locationadmins/locationadmins.component";

//routes
const routes: Routes = [
  {
    path: "",
    component: SecureComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadChildren: () =>
          import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
      },
      {
        path: "profile",
        loadChildren: () =>
          import("./profile/profile.module").then((m) => m.ProfileModule),
      },
      {
        path: "account",
        loadChildren: () =>
          import("./account/account.module").then((m) => m.AccountModule),
      },
      {
        path: "activity",
        loadChildren: () =>
          import("./activity/activity.module").then((m) => m.ActivityModule),
      },
      {
        path: "adminchat",
        loadChildren: () =>
          import("./adminchat/adminchat.module").then((m) => m.AdminchatModule),
      },
      {
        path: "employeechat",
        loadChildren: () =>
          import("./employeechat/employeechat.module").then(
            (m) => m.EmployeechatModule
          ),
      },
      {
        path: "latestspot",
        loadChildren: () =>
          import("./latestspot/latestspot.module").then(
            (m) => m.LatestspotModule
          ),
      },
      {
        path: "bookinglist",
        loadChildren: () =>
          import("./booking-list/booking-list.module").then(
            (m) => m.BookingListModule
          ),
      },
      { path: "customerchat", component: CustomerchatComponent },
      { path: "inquiry", component: InquiryComponent },
      { path: "locationadmins", component: LocationadminsComponent },
      { path: "pricing", component: PricingComponent },
      { path: "contactus", component: ContactusComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecureRoutingModule {}

export const SecureComponents = [
  SecureComponent,
  FullComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  PricingComponent,
  CustomerchatComponent,
  ContactusComponent,
  LatestspotComponent,
  InquiryComponent,
  BookingListComponent,
  LocationadminsComponent
];
