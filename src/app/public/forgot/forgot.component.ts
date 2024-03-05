import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@app-shared";
import { Forgot } from "@app-models";
import { PublicService } from "../public.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CommonUtility } from "@app-core";

@Component({
  templateUrl: "./forgot.component.html",
  styleUrls: ["./forgot.component.scss"],
})
export class ForgotComponent implements OnInit {
  frmForgot: FormGroup;
  isFormSubmitted: boolean;
  error: any;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private notificationService: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(({ verify }) => {
      if (CommonUtility.isNotEmpty(verify)) {
        this.verifyLink(verify);
      }
    });
  }

  verifyLink(activateKey) {
    this.publicService.verify(activateKey).subscribe(
      (result) => {
        this.notificationService.success("Account activated successfully!!");
        this.router.navigateByUrl(`login`);
      },
      (error) => {}
    );
  }

  private createForm() {
    this.frmForgot = this.fb.group({
      email: [
        "",
        [
          Validators.required,
          ValidationService.emailValidator,
          Validators.maxLength(50),
        ],
      ],
    });
  }

  forgot() {
    this.isFormSubmitted = true;
    if (!this.frmForgot.valid) {
      return;
    }

    this.error = null;

    const forgotData: Forgot = new Forgot();
    forgotData.email = this.frmForgot.controls.email.value;

    this.publicService.forgot(forgotData).subscribe(
      (result) => {
        this.notificationService.success("Check your email to reset password");
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
          this.error = "Invalid Email";
        } else {
          this.error = { error: ["Please check your internet connection."] };
        }
      }
    );
  }

  signin() {
    this.router.navigateByUrl("/login");
  }
}
