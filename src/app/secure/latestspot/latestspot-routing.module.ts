import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app-core';
import { FeedbackComponent } from '../dashboard/feedback/feedback.component';
import { LatestspotComponent } from './latestspot.component';
import { ReserveSpotComponent } from '../dashboard/reserve-spot/reserve-spot.component';


const routes: Routes = [
  {
      path: '',
      component: LatestspotComponent,
      canActivate: [AuthGuard],
      children: [

      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LatestspotRoutingModule { }

export const LatestSpotComponents = [
  LatestspotComponent,FeedbackComponent,ReserveSpotComponent
];
