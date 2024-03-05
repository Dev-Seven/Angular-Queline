import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { PublicService } from "./public.service";
import { PublicComponents, PublicRoutingModule } from "./public-routing.module";
import { GoogleMapsModule } from "@angular/google-maps";
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  SocialAuthService,
} from "angularx-social-login";
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
} from "angularx-social-login";
import { environment } from "src/environments/environment";
import { TermConditionModalComponent } from "@app-shared";
import { AccountService } from "../secure/account/account.service";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import { AngularFireModule } from "@angular/fire";
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
import { ScrollingModule } from "@angular/cdk/scrolling";
import {
  AngularFirestore,
  AngularFirestoreModule,
} from "@angular/fire/firestore";
import { FilterPipeModule } from "ngx-filter-pipe";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { Ng2TelInputModule } from "ng2-tel-input";
import { LtPlanComponent } from "./lt-plan/lt-plan.component";

@NgModule({
  declarations: [[...PublicComponents]],
  imports: [
    PublicRoutingModule,
    SharedModule,
    GoogleMapsModule,
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
    AngularFireModule.initializeApp(environment.firebase),
    FilterPipeModule,
    AngularFirestoreModule,
    BsDatepickerModule.forRoot(),
    Ng2TelInputModule,
  ],
  providers: [
    PublicService,
    AccountService,
    BsModalService,
    SocialAuthService,
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.facebookAppId),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  entryComponents: [TermConditionModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PublicModule {}
