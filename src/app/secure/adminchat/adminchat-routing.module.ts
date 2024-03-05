import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app-core";
import { AdminchatComponent } from "./adminchat.component";

//routes
const routes: Routes = [
  {
    path: "",
    component: AdminchatComponent,
    canActivate: [AuthGuard],
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminchatRoutingModule {}

export const AdminchatComponents = [AdminchatComponent];
