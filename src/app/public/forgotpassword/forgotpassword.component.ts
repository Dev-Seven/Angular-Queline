import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ForgotPassword } from "@app-models";
import { PublicService } from "../public.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonUtility } from "@app-core";
import { Subscription } from "rxjs";

@Component({
  templateUrl: "./forgotpassword.component.html",
  styleUrls: ["./forgotpassword.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
  frmForgotPassword: FormGroup;
  isFormSubmitted: boolean;
  newFieldTextType: boolean;
  confirmFieldTextType: boolean;
  error: any;
  private routerSub: Subscription;
  private email: string;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private activatedRoute: ActivatedRoute,
    private notificationService: ToastrService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.routerSub = this.activatedRoute.params.subscribe(({ email }) => {
      if (CommonUtility.isNotEmpty(email)) {
        this.email = email;
      }
    });
  }

  private createForm() {
    this.frmForgotPassword = this.fb.group({
      npassword: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          this.matchValidator.bind(this),
        ],
      ],
      cpassword: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          this.matchValidator.bind(this),
        ],
      ],
    });
  }

  matchValidator(c: AbstractControl) {
    if (this.frmForgotPassword) {
      const toValue = this.frmForgotPassword.get("npassword").value;
      const fromValue = this.frmForgotPassword.get("cpassword").value;
      if (fromValue && toValue && fromValue !== toValue) {
        this.error = { error: ["Passwords doesn't match."] };
      } else {
        this.error = null;
      }
    }
  }
  signin() {
    this.router.navigateByUrl("/login");
  }
  confirmToggleFieldTextType() {
    this.confirmFieldTextType = !this.confirmFieldTextType;
  }
  newToggleFieldTextType() {
    this.newFieldTextType = !this.newFieldTextType;
  }

  forgotpassword() {
    if (this.error && this.error.error.length > 0) {
      this.notificationService.warning(this.error.error);
      return;
    } else if (!this.frmForgotPassword.valid) {
      return;
    } else {
      this.error = null;

      const forgotpasswordData: ForgotPassword = new ForgotPassword();
      forgotpasswordData.password =
        this.frmForgotPassword.controls.npassword.value;
      forgotpasswordData.cpassword =
        this.frmForgotPassword.controls.cpassword.value;
      forgotpasswordData.email = this.email;

      this.publicService.forgotPassword(forgotpasswordData).subscribe(
        (result) => {
          this.notificationService.success(
            "Your password has been reset successfully."
          );
          this.router.navigateByUrl(`login`);
        },
        (error) => {
          if (error && error.status === 400) {
            this.error = error.error ? error.error.modelState || null : null;
          } else if (error && error.status === 500) {
            this.error = {
              error: ["Something went wrong. Please try again later."],
            };
          } else if (error.status === 401) {
            this.error = "Invalid Email or Password";
          } else {
            this.error = { error: ["Please check your internet connection."] };
          }
        }
      );
    }
  }
}
