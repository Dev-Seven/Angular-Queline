import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "@app-core";

import { BookingListComponent } from "./booking-list.component";

const routes: Routes = [
  {
    path: "",
    component: BookingListComponent,
    canActivate: [AuthGuard],
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingListRoutingModule {}

export const BookingListComponents = [];
