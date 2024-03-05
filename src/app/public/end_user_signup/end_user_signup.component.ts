import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService, TermConditionModalComponent } from "@app-shared";
import { EndUser, Location } from "@app-models";
import { PublicService } from "../public.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { CommonUtility } from "@app-core";

@Component({
  templateUrl: "./end_user_signup.component.html",
  styleUrls: ["./end_user_signup.component.scss"],
})
export class EndUserSignupComponent implements OnInit {
  frmSignup: FormGroup;
  isFormSubmitted: boolean;
  error: any;
  signupEmail: boolean = false;
  previousUrl;
  bsModalRef: BsModalRef;
  private routerSub: Subscription;
  isLoaded: boolean = false;
  locationData: Location;
  userId: number;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private notificationService: ToastrService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.routerSub = this.activatedRoute.params.subscribe(
      ({ locationId, partySize, userId, email, phone }) => {
        this.previousUrl = `reservespot/${locationId}/${partySize}`;
        if (CommonUtility.isNotEmpty(userId)) {
          this.publicService.endUserById(userId).subscribe((result) => {
            this.isLoaded = true;
            this.userId = userId;
            this.frmSignup.patchValue({ ...result });
          });
        }

        if (CommonUtility.isNotEmpty(locationId)) {
          this.publicService
            .locationDataByQr(locationId)
            .subscribe((result) => {
              this.locationData = result;
              if (this.locationData.isNameRequired) {
                this.frmSignup.get("name").setValidators([Validators.required]);
                this.frmSignup.get("name").updateValueAndValidity();
              }

              if (this.locationData.isEmailRequired) {
                this.frmSignup
                  .get("email")
                  .setValidators([Validators.required]);
                this.frmSignup.get("email").updateValueAndValidity();
              }

              if (this.locationData.isPhoneRequired) {
                this.frmSignup
                  .get("phone")
                  .setValidators([Validators.required]);
                this.frmSignup.get("phone").updateValueAndValidity();
              }
            });
        }

        if (CommonUtility.isNotEmpty(email) && email !== "null") {
          this.frmSignup.get("email").setValue(email);
        }

        if (CommonUtility.isNotEmpty(phone) && phone !== "null") {
          this.frmSignup.get("phone").setValue(phone);
        }

        if (
          this.locationData.locationInput.some((locationInput) => {
            locationInput.availableFor === "User";
          })
        ) {
        }
      }
    );
  }

  private createForm() {
    this.frmSignup = this.fb.group({
      name: ["", [Validators.maxLength(50)]],
      email: ["", [ValidationService.emailValidator, Validators.maxLength(50)]],
      phone: ["", [Validators.maxLength(20)]],
    });
  }

  signup() {
    this.isFormSubmitted = true;

    if (!this.frmSignup.valid) {
      return;
    }

    this.error = null;

    const userData: EndUser = this.frmSignup.value;
    if (this.userId) {
      this.publicService.endUserUpdate(this.userId, userData).subscribe(
        (result) => {
          this.notificationService.success("Details updated successfully!!");

          this.router.navigateByUrl(`${this.previousUrl}/${result.id}`);
        },
        (error) => {
          if (error && error.status === 400) {
            this.error = error.error ? error.error.modelState || null : null;
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
    } else {
      this.publicService.endUserSignIn(userData).subscribe(
        (result) => {
          this.notificationService.success(
            "Signup has been done successfully!!"
          );
          this.router.navigateByUrl(`${this.previousUrl}/${result.id}`);
        },
        (error) => {
          if (error && error.status === 400) {
            this.error = error.error ? error.error.modelState || null : null;
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
}
