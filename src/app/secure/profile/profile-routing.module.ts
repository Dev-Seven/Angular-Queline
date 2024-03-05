import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProfileComponent } from "./profile.component";
import { ChangePasswordComponent } from "./changepassword/changepassword.component";
import { ProfileEditComponent } from "./edit/edit.component";

const routes: Routes = [
  {
    path: "",
    component: ProfileComponent,
    children: [
      { path: "", redirectTo: "list", pathMatch: "full" },
      { path: "edit/:id", component: ProfileEditComponent },
      { path: "changepassword", component: ChangePasswordComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  entryComponents: [],
})
export class ProfileRoutingModule {}

export const ProfileComponents = [
  ProfileComponent,
  ProfileEditComponent,
  ChangePasswordComponent,
];
