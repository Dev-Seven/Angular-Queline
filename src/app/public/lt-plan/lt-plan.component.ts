import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@app-shared";
import { User } from "@app-models";
import { PublicService } from "../public.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { ApiService } from "../services/api/api.service";

@Component({
  selector: "app-lt-plan",
  templateUrl: "./lt-plan.component.html",
  styleUrls: ["./lt-plan.component.css"],
})
export class LtPlanComponent implements OnInit {
  frmSignup: FormGroup;
  isFormSubmitted: boolean;
  error;
  fieldTextType: boolean;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private router: Router,
    private notificationService: ToastrService,
    private readonly apiservice: ApiService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}
  private createForm() {
    this.frmSignup = this.fb.group({
      firstName: ["", [Validators.required, Validators.maxLength(50)]],
      lastName: ["", [Validators.required, Validators.maxLength(50)]],
      couponCode: ["", [Validators.required, Validators.maxLength(100)]],
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

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
  signup() {
    this.isFormSubmitted = true;

    if (!this.frmSignup.valid) {
      return;
    }

    this.error = null;
    const userData: User = this.frmSignup.value;

    this.publicService.signupForLtPlan(userData).subscribe(
      (result) => {
        if (result.id) {
          this.apiservice.createUser(result.id, {
            name: userData.companyName,
            email: userData.email,
            uniqueid: result.id,
          });

          this.notificationService.success(
            "Signup has been done successfully!!"
          );
          this.router.navigateByUrl(`login`);
        } else {
          this.notificationService.warning(result.message);
        }
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
}
