import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { User, Role, Location } from "@app-models";
import { ValidationService } from "@app-shared";
import { UserAuthService, NotificationService, CommonUtility } from "@app-core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { ProfileService } from "../../profile/profile.service";
import { AccountService } from "../account.service";

@Component({
  templateUrl: "./edit_user.component.html",
  styleUrls: ["./edit_user.component.scss"],
})
export class EditUserComponent implements OnInit {
  frmProfile: FormGroup;
  isFormSubmitted: boolean;
  userId: number;
  companyId: number;
  role: string;
  user: User;
  isLoaded: boolean = false;
  isStaff: boolean = false;
  selectedLocations = [];
  error: any;
  public onClose: Subject<{}>;
  isEditMode: boolean = false;

  roleData: Role[] = [];
  locationData: Array<{ id: number; name: string }> = [];
  fieldTextType: boolean;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private userAuthService: UserAuthService,
    private activatedRoute: ActivatedRoute,
    private bsModalRef: BsModalRef,
    private accountService: AccountService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    
    this.onClose = new Subject();
    if (this.userId) {
      this.isEditMode = true;
      this.profileService.getById(this.userId).subscribe((userData) => {
        this.user = userData;
        if (this.role === "Business Owner") {
          this.isStaff = true;
          this.getRoles();
        }
        if (this.user.locationAdmin) {
          this.getLocations();
          this.user.locationAdmin.forEach((location) => {
            this.selectedLocations.push(location.id);
          });
        }
        this.setFormData();
      });
    } else {
      if (this.role === "Business Owner") {
        this.isStaff = true;
        this.getRoles();
      }
      this.isLoaded = true;
      this.getLocations();
    }
  }

  close() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }

  getRoles() {
    this.profileService.getRoles().subscribe((result) => {
      result.forEach((item) => {
        this.roleData.push({ name: item });
      });
    });
  }
  getLocations() {
    this.accountService
      .getLocationsByCompany(this.companyId)
      .subscribe((result: Location[]) => {
        result.forEach((item) => {
          this.locationData.push({ id: item.id, name: item.name });
        });
      });
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  private createForm() {
    this.frmProfile = this.fb.group({
      firstName: ["", [Validators.required, Validators.maxLength(50)]],
      lastName: ["", [Validators.required, Validators.maxLength(50)]],
      email: [
        "",
        [
          Validators.required,
          ValidationService.emailValidator,
          Validators.maxLength(50),
        ],
      ],
      phone: [
        "",
        [
          Validators.required,
          Validators.maxLength(15),
          ValidationService.allowOnlyNumber,
        ],
      ],
      locationAdminIds: ["", [Validators.required]],
      role: ["", [Validators.required]],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(6),
          ValidationService.passwordValidator,
        ],
      ],
    });
  }

  private setFormData() {
    this.frmProfile.patchValue({ ...this.user });
    this.isLoaded = true;
  }

  save() {
    this.isFormSubmitted = true;
    this.validateAllFormFields(this.frmProfile);
    if (!this.frmProfile.valid) {
      return;
    }

    this.error = null;

    if (this.isEditMode) {
      this.profileService
        .updateProfile(this.userId, this.frmProfile.value)
        .subscribe(
          (result) => {
            this.notificationService.success(
              "Profile details has been updated successfully."
            );
            this.close();
          },
          (error) => {
            if (error && error.status === 400) {
              this.error = error.error ? error.error.modelState || null : null;
            } else if (error && error.status === 500) {
              if (error.error.message.indexOf("ER_DUP_ENTRY") > -1) {
                this.notificationService.warning("Email is already exist!!");
              } else {
                this.error = {
                  error: ["Something went wrong. Please try again later."],
                };
              }
            } else {
              this.error = {
                error: ["Please check your internet connection."],
              };
            }
          }
        );
    } else {
      if (!this.isStaff) {
        this.frmProfile.get("role").setValue("Business Owner");
      }
      this.profileService
        .addStaffUser(
          this.frmProfile.value.locationAdminIds[0],
          this.frmProfile.value
        )
        .subscribe(
          (result) => {
            this.notificationService.success(
              "Profile details has been created successfully."
            );
            this.close();
          },
          (error) => {
            if (error && error.status === 400) {
              this.error = error.error ? error.error.modelState || null : null;
              if (error.error.message) {
                this.notificationService.warning(error.error.message);
              }
            } else if (error && error.status === 500) {
              if (error.error.message.indexOf("ER_DUP_ENTRY") > -1) {
                this.notificationService.warning("Email is already exist!!");
              } else {
                this.error = {
                  error: ["Something went wrong. Please try again later."],
                };
              }
            } else {
              this.error = {
                error: ["Please check your internet connection."],
              };
            }
          }
        );
    }
  }
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  delete() {
    this.profileService.deleteProfile(this.user.id).subscribe((result) => {
      this.close();
    });
  }
}
