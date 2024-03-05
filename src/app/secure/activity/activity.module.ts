import { NgModule } from "@angular/core";
import { GoogleMapsModule } from "@angular/google-maps";
import { MatDialogModule } from "@angular/material";
import { SharedModule } from "@app-shared";
import { BsModalService, ModalModule } from "ngx-bootstrap/modal";
import { NgxPaginationModule } from "ngx-pagination";
import {
  ActivityComponents,
  ActivityRoutingModule,
} from "./activity-routing.module";
import { ActivityService } from "./activity.service";
import { ActivityMapComponent } from "./activity_map/activity_map.component";
import { FeedbackComponent } from "./feedback/feedback.component";

@NgModule({
  declarations: [...ActivityComponents],
  imports: [
    ModalModule.forRoot(),
    SharedModule,
    ActivityRoutingModule,
    GoogleMapsModule,
    NgxPaginationModule,
  ],
  providers: [ActivityService, BsModalService],
  entryComponents: [ActivityMapComponent, FeedbackComponent],
})
export class ActivityModule {}
