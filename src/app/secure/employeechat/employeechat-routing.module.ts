import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app-core";
import { EmployeechatComponent } from "./employeechat.component";

//routes
const routes: Routes = [
  {
    path: "",
    component: EmployeechatComponent,
    canActivate: [AuthGuard],
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeechatRoutingModule {}

export const EmployeechatComponents = [EmployeechatComponent];
