import { BrowserModule } from "@angular/platform-browser";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material-module";
import { SharedModule } from "./shared/shared.module";
import { SpinnerComponent } from "./shared/spinner.component";
import { PublicModule } from "./public/public.module";
import { CoreModule, AuthInterceptor, ResponseInterceptor } from "@app-core";
import { ToastrModule } from "ngx-toastr";
import { ModalModule } from "ngx-bootstrap/modal";
import { environment } from "src/environments/environment";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireModule } from "@angular/fire";
import { MessagingService } from "./service/messaging.service";
import { Ng2TelInputModule } from "ng2-tel-input";
import { AppInterceptor } from "./app.interceptor";
import { NgxSpinnerModule } from "ngx-spinner";
import { CommonService } from "./common.service";
import { NgxPaginationModule } from "ngx-pagination";
import { ShowHidePasswordModule } from "ngx-show-hide-password";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { NgxStripeModule } from "ngx-stripe";
import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
import { DailogexampleComponent } from "./secure/dailogexample/dailogexample.component";
// import { EncrDecrServiceService } from "./service/encr-decr-service.service";
const config: SocketIoConfig = {
  url: environment.serverPath,
  options: { transports: ["websocket", "polling", "flashsocket"] },
};

export const createTranslateLoader = (http: HttpClient) => {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
};

@NgModule({
  declarations: [AppComponent, SpinnerComponent, DailogexampleComponent],
  imports: [
    CoreModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    PublicModule,
    SharedModule,
    SocketIoModule.forRoot(config),
    AppRoutingModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    ModalModule.forRoot(),
    NgxSpinnerModule,
    NgxPaginationModule,
    ShowHidePasswordModule,
    ToastrModule.forRoot({
      timeOut: 6000,
      preventDuplicates: true,
      enableHtml: true,
    }),
    Ng2TelInputModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    NgxStripeModule.forRoot(environment.stripe),
  ],
  providers: [
    MessagingService,
    // EncrDecrServiceService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseInterceptor,
      multi: true,
    },
    CommonService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
