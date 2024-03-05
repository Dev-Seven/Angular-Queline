import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ChangePassword } from "@app-models";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ProfileService } from "../profile.service";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
  templateUrl: "./changepassword.component.html",
  styleUrls: ["./changepassword.component.scss"],
})
export class ChangePasswordComponent implements OnInit {
  frmChangePassword: FormGroup;
  isFormSubmitted: boolean;
  error: any;
  oldFieldTextType: boolean;
  newFieldTextType: boolean;
  confirmFieldTextType: boolean;
  public onClose = new Subject();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    public bsModalRef: BsModalRef
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  private createForm() {
    this.frmChangePassword = this.fb.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
      npassword: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          this.matchValidator.bind(this),
        ],
      ],
      cnpassword: [
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
    if (this.frmChangePassword) {
      const toValue = this.frmChangePassword.get("npassword").value;
      const fromValue = this.frmChangePassword.get("cnpassword").value;
      if (fromValue && toValue && fromValue !== toValue) {
        this.error = { error: ["Passwords doesn't match."] };
      } else {
        this.error = null;
      }
    }
  }

  changepassword() {
    this.isFormSubmitted = true;
    if (!this.frmChangePassword.valid) {
      return;
    }

    if (
      this.frmChangePassword.get("npassword").value ===
      this.frmChangePassword.get("cnpassword").value
    ) {
      this.error = null;

      const changepasswordData: ChangePassword = new ChangePassword();
      changepasswordData.password =
        this.frmChangePassword.controls.password.value;
      changepasswordData.npassword =
        this.frmChangePassword.controls.npassword.value;

      this.profileService.changePassword(changepasswordData).subscribe(
        (result) => {
          this.onClose.next(false);
          this.bsModalRef.hide();
        },
        (error) => {
          if (error && error.status === 400) {
            this.error = error.error ? error.error.modelState || null : null;
          } else if (error && error.status === 500) {
            this.error = {
              error: ["Something went wrong. Please try again later."],
            };
          } else if (error.status === 401) {
            this.error = { error: [error.error.message] };
          } else {
            this.error = { error: ["Please check your internet connection."] };
          }
        }
      );
    } else {
      this.error = { error: ["Passwords doesn't match."] };
    }
  }

  oldToggleFieldTextType() {
    this.oldFieldTextType = !this.oldFieldTextType;
  }
  newToggleFieldTextType() {
    this.newFieldTextType = !this.newFieldTextType;
  }
  confirmToggleFieldTextType() {
    this.confirmFieldTextType = !this.confirmFieldTextType;
  }

  close() {
    this.bsModalRef.hide();
  }
}
