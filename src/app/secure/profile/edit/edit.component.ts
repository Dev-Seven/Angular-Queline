import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { User, FileConfiguration } from "@app-models";
import { ValidationService } from "@app-shared";
import {
  UserAuthService,
  CommonUtility,
  NotificationService,
  FileUploaderService,
  APIConstant,
} from "@app-core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ProfileService } from "../profile.service";
import { UploadType } from "@app-enums";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ChangePasswordComponent } from "../changepassword/changepassword.component";
import { ChangePassword } from "@app-models";

@Component({
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class ProfileEditComponent implements OnInit {
  frmProfile: FormGroup;
  isFormSubmitted: boolean;
  isEditMode: boolean;
  profileData: User;
  profileId: number;
  isBusinessAdmin: boolean = false;
  isSystemAdmin: boolean = false;
  isCurrentUser: boolean = false;
  user: User;
  basePath: string = APIConstant.basePath + "api/";
  maxDate: Date = new Date();

  fileOptions: FileConfiguration = {
    itemAlias: "profilepic",
    maxAllowedFile: 1,
    completeCallback: this.uploadCompleted.bind(this, this),
    onWhenAddingFileFailed: this.uploadFailed.bind(this),
  };

  fileUploader: FileUploaderService = new FileUploaderService(this.fileOptions);

  private routerSub: Subscription;
  error: any;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private userAuthService: UserAuthService,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.user = this.userAuthService.getUser();
    this.isBusinessAdmin = this.userAuthService.isBusinessAdmin();
    this.isSystemAdmin = this.userAuthService.isSuperAdmin();
    this.isCurrentUser = this.user.id === this.profileId ? true : false;
    this.getRouteData();
  }

  private getRouteData() {
    this.routerSub = this.activatedRoute.params.subscribe(({ id }) => {
      if (CommonUtility.isNotEmpty(id)) {
        this.isEditMode = true;
        this.profileId = +id;
        this.getProfileData();
      }
    });
  }
  private getProfileData() {
    this.profileService.getById(this.profileId).subscribe(
      (data) => {
        this.profileData = data;
        this.isCurrentUser = this.user.id === this.profileId ? true : false;

        if (CommonUtility.isNotEmpty(this.profileData.dob)) {
          this.profileData.dob = new Date(this.profileData.dob);
        }
        this.setFormData();
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;

          if (this.error["error"]) {
            this.notificationService.error(this.error["error"]);
          }
        }
      }
    );
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
      phone: [""],
      dob: [""],
    });
  }

  private setFormData() {
    this.frmProfile.patchValue({ ...this.profileData });
  }

  save() {
    this.isFormSubmitted = true;

    if (!this.frmProfile.valid) {
      return;
    }

    this.error = null;

    let profileData: User = new User();
    profileData = Object.assign(profileData || {}, this.frmProfile.value);

    this.profileService.updateProfile(this.profileId, profileData).subscribe(
      (result) => {
        this.router.navigate(["../..", "list"], {
          relativeTo: this.activatedRoute,
        });
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
          this.error = { error: ["Please check your internet connection."] };
        }
      }
    );
  }

  saveNotifications() {}

  onSelectFile(event) {
    this.fileUploader.uploadFiles({
      type: UploadType.ProfilePic,
      id: this.profileId.toString(),
    });
  }

  private uploadCompleted(item: any, response: any) {
    setTimeout(() => {
      this.updateProfileData();
    }, 500);
  }

  private uploadFailed() {
    this.notificationService.warning(
      "You are only allowed to upload jpg/jpeg/png files."
    );
  }

  removePicture() {
    this.profileService.removePicture(this.profileId).subscribe(
      (result: any) => {
        setTimeout(() => {
          this.updateProfileData();
        }, 500);
        this.notificationService.success(
          "Profile picture removed successfully."
        );
      },
      (error) => {}
    );
  }

  updateProfileData() {
    this.profileService.getById(this.profileId).subscribe(
      (data: User) => {
        this.profileData.profilepic = data.profilepic;
        this.userAuthService.saveUser(data);
        this.ngOnInit();
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;

          if (this.error["error"]) {
            this.notificationService.error(this.error["error"]);
          }
        }
      }
    );
  }

  getProfilePic(): string {
    let profilePic: string = "";

    if (
      CommonUtility.isNotEmpty(this.profileData) &&
      CommonUtility.isNotEmpty(this.profileData.profilepic)
    ) {
      profilePic =
        this.basePath + "admin/files/profilepic/" + this.profileData.profilepic;
    } else {
      profilePic = "assets/images/background/user-info.jpg";
    }

    return profilePic;
  }

  bsModalRef: BsModalRef;

  changeUserPassword(item: ChangePassword) {
    this.bsModalRef = this.modalService.show(ChangePasswordComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
    });
    this.bsModalRef.content.onClose.subscribe((result) => {
      this.notificationService.success("Password changed successfully.");
    });
  }
}
