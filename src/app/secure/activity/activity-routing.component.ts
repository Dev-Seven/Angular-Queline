import { NgModule } from "@angular/core";
import { AuthGuard } from "@app-core";
import { RouterModule, Routes } from "@angular/router";
import { BookingInfoComponent } from "../dashboard/booking_info/booking_info.component";
import { ActivityComponent } from "./activity.component";
import { ActivityListComponent } from "./list/list.component";
import { ActivitySearchPanelComponent } from "./search-panel/search-panel.component";

//routes
const routes: Routes = [
  {
    path: "",
    component: ActivityComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", redirectTo: "list", pathMatch: "full" },
      { path: "list", component: ActivityListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  entryComponents: [],
})
export class ActivityRoutingModule {}

export const ActivityComponents = [
  ActivityComponent,
  ActivityListComponent,
  ActivitySearchPanelComponent,
  BookingInfoComponent,
];
