import { NgModule, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@app-shared";
import { UserLogin, Location } from "@app-models";
import { PublicService } from "../public.service";
import { Router } from "@angular/router";
import { UserAuthService } from "@app-core";
import { AccountService } from "src/app/secure/account/account.service";
import { ApiService } from "src/app/secure/services/api/api.service";
import { TranslateModule } from "@ngx-translate/core";
import { TranslateService } from "@ngx-translate/core";
import { MessagingService } from "../../service/messaging.service";

@NgModule({
  imports: [TranslateModule],
  exports: [TranslateModule],
  providers: [],
})
@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  frmLogin: FormGroup;
  isFormSubmitted: boolean;
  error: any;
  fieldTextType: boolean;
  repeatFieldTextType: boolean;
  message;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private userAuthService: UserAuthService,
    private accountService: AccountService,
    private router: Router,
    public translate: TranslateService,
    private apiservice: ApiService,
    private messagingService: MessagingService
  ) {
    translate.addLangs(["English", "French", "Spanish", "Italy"]);
    if (localStorage.getItem("locale")) {
      const browserLang = localStorage.getItem("locale");
      translate.use(
        browserLang.match(/English|French|Spanish|Italy/)
          ? browserLang
          : "English"
      );
    } else {
      localStorage.setItem("locale", "English");
      translate.setDefaultLang("English");
    }
    this.createForm();
  }

  ngOnInit(): void {
    this.messagingService.requestPermission();
    this.messagingService.receiveMessage();
    this.message = this.messagingService.currentMessage;

    if (this.userAuthService.isLoggedIn()) {
      this.router.navigate(["secure"]);
    }
  }
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleRepeatFieldTextType() {
    this.repeatFieldTextType = !this.repeatFieldTextType;
  }
  private createForm() {
    this.frmLogin = this.fb.group({
      email: [
        "",
        [
          Validators.required,
          ValidationService.emailValidator,
          Validators.maxLength(50),
        ],
      ],
      password: ["", [Validators.required, Validators.minLength(8)]],
    });
  }

  login() {
    this.isFormSubmitted = true;
    if (!this.frmLogin.valid) {
      return;
    }

    this.error = null;

    const loginData: UserLogin = new UserLogin();
    loginData.email = this.frmLogin.controls.email.value;
    loginData.password = this.frmLogin.controls.password.value;
    loginData.deviceToken = localStorage.getItem("deviceToken");

    this.publicService.signin(loginData).subscribe(
      (result) => {
        this.userAuthService.saveToken(result.accessToken);
        this.userAuthService.saveUser(result.admin);

        if (this.userAuthService.isSuperAdmin()) {
          this.apiservice.setCreateCurrentUser(result.admin.id, {
            name: result.admin.firstName,
            email: result.admin.email,
            locationId: "",
            uniqueId: "System Admin",
          });
        }

        localStorage.setItem("uid", result.admin.id);

        if (this.userAuthService.isBusinessAdmin()) {
          this.apiservice.setCreateCurrentUser(result.admin.id, {
            name: result.admin.firstName,
            email: result.admin.email,
            locationId: "",
            uniqueId: "Business Admin",
          });
          this.accountService
            .getLocationsByCompany(result.admin.id)
            .subscribe((locations: Location[]) => {
              if (locations && locations.length > 0) {
                this.router.navigate(["secure"]);
                localStorage.setItem("locationId", `${locations[0].id}`);
                localStorage.setItem("locationQrId", locations[0].qrCodeURL);
              } else {
                this.router.navigate([
                  "secure",
                  "profile",
                  "edit",
                  result.admin.id.toString(),
                ]);
              }
            });
        } else if (this.userAuthService.isStoreSupport()) {
          this.accountService
            .getLocationsByCompany(result.admin.id)
            .subscribe((locations: Location[]) => {
              if (locations && locations.length > 0) {
                this.router.navigate(["secure"]);
                localStorage.setItem("locationId", `${locations[0].id}`);
                localStorage.setItem("locationQrId", locations[0].qrCodeURL);
                this.apiservice.setCreateCurrentUser(result.admin.id, {
                  name: result.admin.firstName,
                  email: result.admin.email,
                  locationId: locations[0].id,
                  uniqueId: "support",
                });
              } else {
                this.router.navigate([
                  "secure",
                  "profile",
                  "edit",
                  result.admin.id.toString(),
                ]);
              }
            });
        } else {
          this.router.navigate(["secure"]);
        }
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;
        } else if (error && error.status === 500) {
          this.error = {
            error: ["Something went wrong. Please try again later."],
          };
        } else if (error.status === 401) {
          this.error = "Invalid Username or Password";
        } else {
          this.error = { error: ["Please check your internet connection."] };
        }
      }
    );
  }

  signup() {
    this.router.navigateByUrl("/signup");
  }

  changeLang(language: string) {
    localStorage.setItem("locale", language);
    this.translate.use(language);
  }
}
