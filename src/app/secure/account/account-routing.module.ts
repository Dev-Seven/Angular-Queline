import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { AccountAddEditComponent } from "./add-edit/add-edit.component";
import { AccountComponent } from "./account.component";
import { AccountSettingsComponent } from "./settings/settings.component";
import { CustomerInfoComponent } from "./customer_info/customer_info.component";
import { EditCustomerInfoComponent } from "./edit_customer_info/edit_customer_info.component";
import { EditDefaultCustomerInfoComponent } from "./edit_default_customer_info/edit_default_customer_info.component";
import { EditUserComponent } from "./edit_user/edit_user.component";
import { OpeningInfoComponent } from "./opening_info/opening_info.component";
import { BookingHoursComponent } from "./booking-hours/booking-hours.component";

//routes
const routes: Routes = [
  {
    path: "",
    component: AccountComponent,
    children: [
      { path: "", redirectTo: "settings", pathMatch: "full" },
      {
        path: "store",
        component: AccountAddEditComponent,
      },
      { path: "store/:id", component: AccountAddEditComponent },
      { path: "store/new", component: AccountAddEditComponent },
      { path: "settings", component: AccountSettingsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}

export const AccountComponents = [
  AccountComponent,
  AccountAddEditComponent,
  AccountSettingsComponent,
  CustomerInfoComponent,
  EditCustomerInfoComponent,
  EditDefaultCustomerInfoComponent,
  EditUserComponent,
  OpeningInfoComponent,
  BookingHoursComponent,
];
