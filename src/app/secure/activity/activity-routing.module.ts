import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app-core";
import { ActivityComponent } from "./activity.component";
import { ActivityMapComponent } from "./activity_map/activity_map.component";
import { FeedbackComponent } from "./feedback/feedback.component";
import { ActivityListComponent } from "./list/list.component";
import { ActivitySearchPanelComponent } from "./search-panel/search-panel.component";

//routes
const routes: Routes = [
  {
    canActivate: [AuthGuard],
    path: "",
    component: ActivityComponent,
    children: [
      { path: "", redirectTo: "list", pathMatch: "full" },
      { path: "list", component: ActivityListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityRoutingModule {}

export const ActivityComponents = [
  ActivityComponent,
  ActivityListComponent,
  ActivitySearchPanelComponent,
  ActivityMapComponent,
  FeedbackComponent,
];
