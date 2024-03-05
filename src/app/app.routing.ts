import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

//routes
const routes: Routes = [
  { path: "", redirectTo: "secure", pathMatch: "full" },
  {
    path: "secure",
    loadChildren: () =>
      import("./secure/secure.module").then((m) => m.SecureModule),
  },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), TranslateModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}

export const AppComponents = [];
