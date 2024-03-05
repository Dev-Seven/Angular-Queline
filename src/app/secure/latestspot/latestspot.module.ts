import { CUSTOM_ELEMENTS_SCHEMA,NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { AccountService } from '../account/account.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ProfileService } from '../profile/profile.service';
import { LatestspotRoutingModule } from './latestspot-routing.module';
import { UserAuthService } from 'src/app/core/service/auth.service';
import { PublicService } from 'src/app/public/public.service';
import { FeedbackComponent } from '../dashboard/feedback/feedback.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LatestspotRoutingModule
  ],
  providers:[
        UserAuthService,
        DashboardService,
        ProfileService,
        AccountService,
        PublicService,
        BsModalService,
  ],
  entryComponents: [
    FeedbackComponent
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LatestspotModule { }
