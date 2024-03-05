import { NgModule } from "@angular/core";
import { SecureComponents, SecureRoutingModule } from "./secure-routing.module";
import { SharedModule } from "@app-shared";
import { UserAuthService } from "@app-core";
import { ScrollingModule } from "@angular/cdk/scrolling";
import {
  AngularFirestore,
  AngularFirestoreModule,
} from "@angular/fire/firestore";
import { FilterPipeModule } from "ngx-filter-pipe";

import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
} from "@angular/material";
import { CustomerInfoComponent } from "./account/customer_info/customer_info.component";
import { NgxPaginationModule } from "ngx-pagination";
import { NgxStripeModule } from "ngx-stripe";
import { FormsModule } from "@angular/forms";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { LocationadminsComponent } from './locationadmins/locationadmins.component';
import { ProfileService } from "./profile/profile.service";
@NgModule({
  declarations: [[...SecureComponents]],
  imports: [
    SecureRoutingModule,
    SharedModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatInputModule,
    MatButtonModule,
    ScrollingModule,
    MatSnackBarModule,
    MatListModule,
    MatDialogModule,
    ScrollToModule.forRoot(),
    FilterPipeModule,
    NgxPaginationModule,
    AngularFirestoreModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgxStripeModule,
    FormsModule,
  ],
  exports: [NgxStripeModule, FormsModule],
  entryComponents: [CustomerInfoComponent],
  providers: [UserAuthService,ProfileService],
})
export class SecureModule {}
