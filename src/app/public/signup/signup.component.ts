import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService, TermConditionModalComponent } from "@app-shared";
import { User } from "@app-models";
import { PublicService } from "../public.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from "angularx-social-login";
import { ApiService } from "../services/api/api.service";
import { Subscription } from "rxjs";

@Component({
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit {
  frmSignup: FormGroup;
  isFormSubmitted: boolean;
  terms: boolean;
  error: any;
  private routerSub: Subscription;
  signupEmail: boolean = false;
  exactMatchcompany: boolean = false;
  user;
  bsModalRef: BsModalRef;
  fieldTextType: boolean;
  disableTextbox: boolean = false;
  repeatFieldTextType: boolean;
  public value: string;
  active: boolean;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private router: Router,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private notificationService: ToastrService,
    private authService: SocialAuthService,
    private readonly apiservice: ApiService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      if (this.user != null) {
        this.emailClick(true);
        this.frmSignup.get("email").setValue(this.user.email);
        this.frmSignup.get("firstName").setValue(this.user.firstName);
        this.frmSignup.get("lastName").setValue(this.user.lastName);

        this.authService.signOut();
      }
    });
    this.routerSub = this.activatedRoute.queryParams.subscribe((result) => {
      this.frmSignup.get("email").setValue(result.email);
      this.frmSignup.get("firstName").setValue(result.firstName);
      this.value = result.value;
    });
  }

  toggle() {
    let control = this.frmSignup.get("email");
    control.disabled ? control.enable() : control.disable();
  }
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleRepeatFieldTextType() {
    this.repeatFieldTextType = !this.repeatFieldTextType;
  }

  private createForm() {
    this.frmSignup = this.fb.group({
      firstName: ["", [Validators.required, Validators.maxLength(50)]],
      lastName: ["", [Validators.required, Validators.maxLength(50)]],
      email: [
        "",
        [
          Validators.required,
          ValidationService.emailValidator,
          Validators.maxLength(50),
          ValidationService.compareEmail,
        ],
      ],
      password: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{7,30}"
          ),
        ],
      ],
      companyName: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          ValidationService.companyUnique,
          ValidationService.validName,
        ],
      ],
    });
  }

  signGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }
  signup() {
    this.isFormSubmitted = true;

    if (!this.frmSignup.valid) {
      return;
    }

    this.error = null;
    const userData: User = this.frmSignup.value;

    this.publicService.signup(userData).subscribe(
      (result) => {
        this.apiservice.createUser(result.id, {
          name: userData.companyName,
          email: userData.email,
          uniqueid: result.id,
        });

        this.notificationService.success("Signup has been done successfully!!");
        this.router.navigateByUrl(`login`);
      },
      (error) => {
        if (error && error.status === 400) {
          this.notificationService.warning(error.error.message);
        } else if (error && error.status === 500) {
          if (error.error.message.indexOf("ER_DUP_ENTRY") >= -1) {
            this.notificationService.warning("Email is already exist!!");
          } else {
            this.error = {
              error: ["Something went wrong. Please try again later."],
            };
          }
        } else {
          this.error = { error: ["Please check your internet connection."] };
        }
      }
    );
  }

  emailClick(withEmail: boolean) {
    this.signupEmail = withEmail;
  }

  showTermsAndConditions() {
    const initialState = {};

    this.bsModalRef = this.modalService.show(TermConditionModalComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
      class: "modal-lg",
    });

    this.bsModalRef.content.onClose.subscribe((result: any) => {});
  }
  signin() {
    this.router.navigateByUrl("/login");
  }
}
