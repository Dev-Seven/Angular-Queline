import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  BbCalendar,
  Calendar,
  FeedbackData,
  FileConfiguration,
  List,
  Location,
  SlotConfig,
  User,
} from "@app-models";
import {
  UserAuthService,
  CommonUtility,
  NotificationService,
  APIConstant,
  FileUploaderService,
  CommonConstant,
} from "@app-core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AccountService } from "../account.service";
import {
  NgxQrcodeElementTypes,
  NgxQrcodeErrorCorrectionLevels,
} from "@techiediaries/ngx-qrcode";
import { ProfileService } from "../../profile/profile.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { CustomerInfoComponent } from "../customer_info/customer_info.component";
import { EditUserComponent } from "../edit_user/edit_user.component";
import { ValidationService } from "@app-shared";
import { UploadType } from "@app-enums";
import { OpeningInfoComponent } from "../opening_info/opening_info.component";
import { DailogexampleComponent } from "../../dailogexample/dailogexample.component";
import { BookingHoursComponent } from "../booking-hours/booking-hours.component";
import { PublicService } from "src/app/public/public.service";
import { addDays, format } from "date-fns";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { formatDate } from "@angular/common";
import { C } from "@angular/cdk/keycodes";

enum Tabs {
  WaitList,
  Styling,
  Users,
  BusinessInfo,
  Booking,
  Sound,
  TwilioInfo,
}

@Component({
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class AccountSettingsComponent implements OnInit {
  frmLocation: FormGroup;
  frmCalendar: FormGroup;
  frmCheckIn: FormGroup;
  frmWaitList: FormGroup;
  frmTwilio: FormGroup;
  frmbusinessName: FormGroup;
  frmbusinessEmail: FormGroup;
  frmbusinessType: FormGroup;
  frmWebsite: FormGroup;
  frmPrivacyPolicy: FormGroup;
  frmAddress: FormGroup;
  frmFeedback: FormGroup;

  isLocationFormSubmitted: boolean;
  isCheckInFormSubmitted: boolean;
  isWaitListFormSubmitted: boolean;
  isTwilioFormSubmitted: boolean;
  isBusinessNameFormSubmitted: boolean;
  isBusinessEmailFormSubmitted: boolean;
  isBusinessTypeFormSubmitted: boolean;
  isWebsiteFormSubmitted: boolean;
  isPrivacyPolicyFormSubmitted: boolean;
  isAddressFormSubmitted: boolean;
  isFeedbackFormSubmitted: boolean;

  isLocationNameEdit: boolean = false;
  isCheckInEdit: boolean = false;
  isWaitListUrlEdit: boolean = false;

  planDetails = { plan: 0 };
  currentPlan;
  planid: number;

  bbCalendar: BbCalendar[];
  isTwilioEdit: boolean = false;
  isCompanyNameEdit: boolean = false;
  isBusinessEmailEdit: boolean = false;
  isBusinessTypeEdit: boolean = false;
  isWebsiteEdit: boolean = false;
  isPrivacyPolicyEdit: boolean = false;
  isAddressEdit: boolean = false;
  isFeedbackEdit: boolean = false;
  isThemeEdit: boolean = false;
  storeBooking: boolean = false;
  businessTypeData = [];
  themeData = [];
  businessType: string;
  theme: string;
  bookingId: number;

  user: User;

  companyId: number;
  companyData: User[];
  url: string;

  locationId: number = 0;
  locationData: Location[] = [];
  allLocationData: Location[];

  public elementType = NgxQrcodeElementTypes.URL;
  public correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  public value: string;
  private routerSub: Subscription;
  error: any;
  loading: boolean;
  companyName: string;
  basePath: string = APIConstant.basePath + "api/";
  address = "";
  active: boolean;
  timingsCollapse: boolean;
  isTwillioInfoShow: boolean = false;
  tabs = Tabs;
  currentTab: number = Tabs.WaitList;
  isSuperAdmin: boolean = false;
  isBusinessOwner: boolean = false;
  isManager: boolean = false;
  branding: boolean = false;
  chatting: boolean = false;
  minDate: Date;
  profileData: User[];
  selectedUser: User;
  bookingHoursData: Array<BbCalendar> = [];
  logoOptions: FileConfiguration = {
    itemAlias: "image",
    maxAllowedFile: 1,
    completeCallback: this.logoUploadCompleted.bind(this, this),
    onWhenAddingFileFailed: this.uploadFailed.bind(this),
  };
  waitlistSound: boolean;
  bookingSound: boolean;
  logoUploader: FileUploaderService = new FileUploaderService(this.logoOptions);
  feedbackData: FeedbackData[];
  slotConfig: SlotConfig;
  slotMin: string;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private accountService: AccountService,
    private userAuthService: UserAuthService,
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private modalService: BsModalService,
    private router: Router,
    private notificationService: NotificationService,
    public dialog: MatDialog
  ) {
    this.minDate = new Date();
    this.createForm();
  }

  ngOnInit(): void {
    this.url = window.location.origin;
    this.address = "";

    this.businessTypeData = [];
    this.themeData = [];
    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
    this.isManager = this.userAuthService.isManager();
    this.user = this.userAuthService.getUser();
    if (this.isSuperAdmin) {
      this.companyId = 2;
    } else {
      this.companyId = this.user.id;
      this.waitlistSound = this.user.waitlistSound;
      this.bookingSound = this.user.bookingSound;
    }
    this.getRouteData();
    this.getPlanDetails();
  }

  private getRouteData() {
    this.routerSub = this.activatedRoute.params.subscribe(({ id }) => {
      if (CommonUtility.isNotEmpty(id)) {
        this.locationId = id;
      }
    });
    this.accountService.get().subscribe((result: Location[]) => {
      this.allLocationData = result || [];
      this.loading = false;
    });
    this.getProfileData();
    this.getBusinessType();
  }

  private getProfileData() {
    this.loading = true;
    this.profileData = [];

    this.profileService.getProfiles().subscribe((result: User[]) => {
      this.user.companyName = result[0].companyName;
      if (this.user.twilio) {
        this.user.twilio.sid = result[0]?.twilio?.sid;
        this.user.twilio.authtoken = result[0]?.twilio?.authtoken;
        this.user.twilio.phonenumber = result[0]?.twilio?.phonenumber;
      }
      this.user.businessType = result[0].businessType;
      this.user.businessEmail = result[0].businessEmail;
      this.user.privacyPolicy = result[0].privacyPolicy;
      this.user.website = result[0].website;
      this.user.address1 = result[0].address1;
      this.user.address2 = result[0].address2;
      this.user.city = result[0].city;
      this.user.state = result[0].state;
      this.user.country = result[0].country;
      this.user.balance = result[0].balance;
      this.profileData = result || [];
      this.loading = false;
    });
  }

  getPlanDetails() {
    const businessDetails = this.accountService

      .getBusinessSports({ business_id: this.companyId })
      .subscribe((result) => {
        this.planDetails = result;
        if (this.planDetails.plan == 1) {
          this.currentPlan = "Basic";
          this.planid = 1;
        } else if (this.planDetails.plan == 2) {
          this.currentPlan = "Starter";
          this.planid = 2;
        } else if (this.planDetails.plan == 3) {
          this.currentPlan = "Enterprice";
          this.planid = 3;
        } else if (this.planDetails.plan == 10) {
          this.currentPlan = "Main Monthly";
          this.planid = 10;
        }
        if (
          this.planDetails.plan == 2 ||
          this.planDetails.plan == 9 ||
          this.planDetails.plan == 10
        ) {
          this.isTwillioInfoShow = true;
        }
      });
  }

  getProfilePic(userId: number): string {
    let profilePic: string = "";
    if (
      CommonUtility.isNotEmpty(this.profileData[userId]) &&
      CommonUtility.isNotEmpty(this.profileData[userId].profilepic)
    ) {
      profilePic =
        this.basePath +
        "admin/files/profilepic/" +
        this.profileData[userId].profilepic;
    } else {
      profilePic = "assets/images/background/user-info.jpg";
    }

    return profilePic;
  }

  getBusinessType() {
    this.accountService.getBusinessTypes().subscribe((result) => {
      for (const key in result) {
        this.businessTypeData.push({ key: key, value: result[key] });
      }
      this.accountService.getThemes().subscribe((result) => {
        for (const key in result) {
          this.themeData.push({ key: key, value: result[key] });
        }
        this.getCompanies();
      });
    });
  }

  changeTheme(theme) {
    this.theme = theme;
  }

  collapse() {
    this.active = !this.active;
  }
  saveTheme() {
    this.accountService
      .changeTheme(this.locationId, this.theme)
      .subscribe((result) => {
        this.ngOnInit();
      });
  }

  getCompanies() {
    this.companyData = [];
    if (this.isSuperAdmin) {
      this.profileService.getProfiles().subscribe((result: User[]) => {
        if (CommonUtility.isNotEmpty(result)) {
          this.companyData = result.filter((user) => user.companyName !== null);
          if (
            this.userAuthService.getCompanyName() &&
            this.companyData.find(
              (loc) => loc.id == Number(this.userAuthService.getCompanyName())
            )
          ) {
            this.companyId = Number(this.userAuthService.getCompanyName());
          } else {
            this.companyId = this.companyId[0].id;
          }
        }
      });
    } else {
      this.selectedUser = this.user;
      this.companyId = this.user.id;
    }
    this.getLocations();
  }

  getLocations() {
    this.address = "";
    this.accountService
      .getLocationsByCompany(this.companyId)
      .subscribe((result: Location[]) => {
        this.locationData = result;

        if (this.isSuperAdmin) {
          this.selectedUser = this.companyData.find(
            (user) => user.id == this.companyId
          );
          this.locationData = this.locationData.filter(
            (t) => t.businessAdminId == this.companyId
          );
        }
        this.locationData = this.locationData.filter((t) =>
          CommonUtility.isNotEmpty(t.name)
        );
        this.userAuthService.saveCompanyName(this.companyId.toString());
        if (CommonUtility.isNotEmpty(this.locationData)) {
          if (
            this.userAuthService.getLocationName() &&
            this.locationData.find(
              (loc) => loc.id == Number(this.userAuthService.getLocationName())
            )
          ) {
            this.locationId = Number(this.userAuthService.getLocationName());
          } else {
            this.locationId = this.locationData[0].id;
          }
          this.selectLocation();
          this.fillData();
        } else if (
          this.isBusinessOwner &&
          CommonUtility.isEmpty(this.locationData)
        ) {
          this.notificationService.info("Please add store details");
          this.router.navigateByUrl("secure/account/store/new");
          return;
        }
      });
  }

  fillData() {
    this.frmbusinessName.controls.companyName.setValue(
      this.selectedUser.companyName
    );
    this.frmTwilio.controls.sid.setValue(this.selectedUser?.twilio?.sid);
    this.frmTwilio.controls.authtoken.setValue(
      this.selectedUser?.twilio?.authtoken
    );
    this.frmTwilio.controls.phonenumber.setValue(
      this.selectedUser?.twilio?.phonenumber
    );
    this.frmbusinessEmail.controls.businessEmail.setValue(
      this.selectedUser.businessEmail
    );
    this.frmbusinessType.controls.businessType.setValue(
      this.businessTypeData.find(
        (data) => data.value == this.selectedUser.businessType
      ).key
    );
    this.businessType = this.businessTypeData.find(
      (data) => data.value == this.selectedUser.businessType
    ).key;

    this.frmWebsite.controls.website.setValue(this.selectedUser.website);
    this.frmPrivacyPolicy.controls.privacyPolicy.setValue(
      this.selectedUser.privacyPolicy
    );

    if (this.selectedUser.address1) this.address += this.selectedUser.address1;

    if (this.selectedUser.address2)
      this.address += ", " + this.selectedUser.address2;

    if (this.selectedUser.city) this.address += ", " + this.selectedUser.city;

    if (this.selectedUser.state) this.address += ", " + this.selectedUser.state;

    if (this.selectedUser.country)
      this.address += ", " + this.selectedUser.country;
  }

  selectLocation() {
    if (CommonUtility.isNotEmpty(this.locationId)) {
      var location = this.locationData.find((t) => t.id == this.locationId);

      this.userAuthService.saveLocation(this.locationId.toString());
      if (location.image) {
        this.userAuthService.saveLocationLogo(location.image);
      } else {
        this.userAuthService.saveLocationLogo("");
      }
      this.frmLocation.controls.name.setValue(location.name);

      this.frmCheckIn.controls.checkInUrl.setValue(
        location.checkInUrl.split(" ").join("-")
      );
      this.frmWaitList.controls.waitListUrl.setValue(location.waitListUrl);
      this.frmWaitList.controls.isPublicWaitList.setValue(
        location.isPublicWaitList
      );
      this.frmCheckIn.controls.isAllowCheckIn.setValue(location.isAllowCheckIn);
      this.frmLocation.controls.qrCodeURL.setValue(location.qrCodeURL);

      this.theme = location.theme;
      this.branding = location.branding;
      this.chatting = location.chatting;
      this.storeBooking = location.storeBooking;
      this.accountService
        .getBbOpeningHours(this.locationId)
        .subscribe((result) => {
          this.bbCalendar = result;
        });
      this.GetCalendarData();
      this.getProfileData();
    }
  }

  tabClick(tab: number) {
    this.currentTab = tab;

    switch (this.currentTab) {
      case this.tabs.WaitList:
        break;
      case this.tabs.Styling:
        break;
      case this.tabs.Users:
        break;
      case this.tabs.Booking:
        break;
      case this.tabs.Sound:
        break;
      case this.tabs.BusinessInfo:
        break;
      case this.tabs.TwilioInfo:
        break;
    }
  }

  saveLocation() {
    this.isLocationFormSubmitted = true;
    if (!this.frmLocation.valid) {
      return;
    }

    this.error = null;

    const locationData: Location = this.locationData.find(
      (t) => t.id == this.locationId
    );
    if (this.frmLocation.value.name && this.frmLocation.value.qrCodeURL) {
      locationData.name = this.frmLocation.value.name;
      locationData.qrCodeURL = this.frmLocation.value.qrCodeURL;
    }

    this.accountService.update(this.locationId, locationData).subscribe(
      (result) => {
        this.notificationService.success(
          "Location Name has been updated successfully."
        );
        if (!false) {
          this.ngOnInit();
        }
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;
        } else if (error && error.status === 500) {
          this.error = {
            error: ["Something went wrong. Please try again later."],
          };
        } else {
          this.error = { error: ["Please check your internet connection."] };
        }
      }
    );
  }

  saveCheckIn() {
    this.isCheckInFormSubmitted = true;
    if (!this.frmCheckIn.valid) {
      return;
    }

    this.error = null;

    const locationData: Location = this.frmCheckIn.value;

    this.accountService.update(this.locationId, locationData).subscribe(
      (result) => {
        this.notificationService.success(
          "Location Name has been updated successfully."
        );
        if (!false) {
          this.ngOnInit();
        }
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;
        } else if (error && error.status === 500) {
          this.error = {
            error: ["Something went wrong. Please try again later."],
          };
        } else {
          this.error = { error: ["Please check your internet connection."] };
        }
      }
    );
  }

  saveWaitList() {
    this.isWaitListFormSubmitted = true;
    if (!this.frmWaitList.valid) {
      return;
    }

    this.error = null;

    const locationData: Location = this.frmWaitList.value;
    this.accountService.update(this.locationId, locationData).subscribe(
      (result) => {
        this.notificationService.success(
          "Location Name has been updated successfully."
        );
        if (!false) {
          this.ngOnInit();
        }
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;
        } else if (error && error.status === 500) {
          this.error = {
            error: ["Something went wrong. Please try again later."],
          };
        } else {
          this.error = { error: ["Please check your internet connection."] };
        }
      }
    );
  }

  saveTwilioKey() {
    this.isTwilioFormSubmitted = true;
    debugger;
    if (this.frmTwilio.valid) {
      this.error = null;
      this.saveUser(this.frmTwilio.value);
      this.isTwilioEdit = false;
    } else {
      return;
    }
  }
  saveCompanyName() {
    this.isBusinessNameFormSubmitted = true;
    if (!this.frmbusinessName.valid) {
      return;
    }
    this.error = null;
    this.saveUser(this.frmbusinessName.value);
    this.isCompanyNameEdit = false;
  }

  saveBusinessEmail() {
    if (
      this.frmbusinessEmail.value.businessEmail != null &&
      this.frmbusinessEmail.value.businessEmail != ""
    ) {
      this.isBusinessEmailFormSubmitted = true;
      if (!this.frmbusinessEmail.valid) {
        return;
      }
      this.error = null;
      this.saveUser(this.frmbusinessEmail.value);
      this.isBusinessEmailEdit = false;
    } else {
      this.notificationService.error("Please enter some text");
    }
  }

  saveBusinessType() {
    this.isBusinessTypeFormSubmitted = true;
    if (!this.frmbusinessType.valid) {
      return;
    }
    this.error = null;
    this.saveUser(this.frmbusinessType.value);
    this.isBusinessTypeEdit = false;
  }

  saveWebsite() {
    if (
      this.frmWebsite.value.website != null &&
      this.frmWebsite.value.website != ""
    ) {
      this.isWebsiteFormSubmitted = true;
      if (!this.frmWebsite.valid) {
        return;
      }
      this.error = null;
      this.saveUser(this.frmWebsite.value);
      this.isWebsiteEdit = false;
    } else {
      this.notificationService.error("Please enter some text");
    }
  }

  savePrivacyPolicy() {
    this.isPrivacyPolicyFormSubmitted = true;
    if (!this.frmPrivacyPolicy.valid) {
      return;
    }
    this.error = null;
    this.saveUser(this.frmPrivacyPolicy.value);
    this.isPrivacyPolicyEdit = false;
  }

  saveAddress() {
    this.isAddressFormSubmitted = true;
    if (!this.frmAddress.valid) {
      return;
    }
    this.error = null;
    this.saveUser(this.frmAddress.value);
    this.isAddressEdit = false;
  }

  saveFeedback() {
    if (
      this.frmFeedback.value.feedback != null &&
      this.frmFeedback.value.feedback != ""
    ) {
      this.isFeedbackFormSubmitted = true;
      this.frmFeedback.get("businessAdminId").setValue(this.selectedUser.id);
      if (!this.frmFeedback.valid) {
        return;
      }
      this.error = null;
      this.accountService.addFeedback(this.frmFeedback.value).subscribe(
        (result) => {
          if (!false) {
            if (!this.isSuperAdmin) {
              this.user.feedback.push(result);
              this.userAuthService.saveUser(this.user);
            }
            this.ngOnInit();
          }
        },
        (error) => {
          if (error && error.status === 400) {
            this.error = error.error ? error.error.modelState || null : null;
          } else if (error && error.status === 500) {
            this.error = {
              error: ["Something went wrong. Please try again later."],
            };
          } else {
            this.error = { error: ["Please check your internet connection."] };
          }
        }
      );
    } else {
      this.notificationService.error("Please enter some text");
    }
  }

  deleteFeedback(feedbackId) {
    this.accountService.removeFeedback(feedbackId).subscribe(
      (result) => {
        if (!false) {
          if (!this.isSuperAdmin) {
            this.user.feedback = this.user.feedback.filter(
              (feedback) => feedback.id !== feedbackId
            );
            this.userAuthService.saveUser(this.user);
          }
          this.ngOnInit();
        }
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;
        } else if (error && error.status === 500) {
          this.error = {
            error: ["Something went wrong. Please try again later."],
          };
        } else {
          this.error = { error: ["Please check your internet connection."] };
        }
      }
    );
  }

  saveUser(userData: User) {
    this.profileService.update(this.selectedUser.id, userData).subscribe(
      (result) => {
        this.userAuthService.saveUser(result);
        this.user = result;
        this.selectedUser = result;
        this.fillData();
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error.message;
        } else if (error && error.status === 500) {
          this.error = "Something went wrong. Please try again later";
        } else {
          this.error = "Please check your internet connection";
        }
        this.notificationService.error(this.error);
      }
    );
    this.ngOnInit();
  }

  private createForm() {
    this.frmLocation = this.fb.group({
      name: [null, [Validators.maxLength(50)]],
      qrCodeURL: [null],
    });
    this.frmCalendar = this.fb.group({
      slotMin: ["60"],
      startDate: [new Date(this.minDate)],
      endDate: [addDays(new Date(this.minDate), 6)],
      maxPartySize: [
        1,
        [Validators.required, ValidationService.allowOnlyNumber],
      ],
    });
    this.frmCheckIn = this.fb.group({
      checkInUrl: [null, [Validators.maxLength(50)]],
      isAllowCheckIn: [null],
    });
    this.frmWaitList = this.fb.group({
      waitListUrl: [null, [Validators.maxLength(50)]],
      isPublicWaitList: [null],
    });
    this.frmTwilio = this.fb.group({
      authtoken: [null, [Validators.required, Validators.maxLength(100)]],
      sid: [null, [Validators.required, Validators.maxLength(100)]],
      phonenumber: [null, [Validators.required, Validators.maxLength(100)]],
    });
    this.frmbusinessName = this.fb.group({
      companyName: [null, [Validators.maxLength(50)]],
    });
    this.frmbusinessEmail = this.fb.group({
      businessEmail: [
        null,
        [Validators.maxLength(50), ValidationService.emailValidator],
      ],
    });
    this.frmbusinessType = this.fb.group({
      businessType: [[]],
    });
    this.frmWebsite = this.fb.group({
      website: [null, [Validators.maxLength(50)]],
    });
    this.frmPrivacyPolicy = this.fb.group({
      privacyPolicy: [null, [Validators.maxLength(50)]],
    });
    this.frmAddress = this.fb.group({
      address1: ["", [Validators.maxLength(50)]],
      address2: ["", [Validators.maxLength(50)]],
      city: ["", [Validators.maxLength(50)]],
      state: ["", [Validators.maxLength(50)]],
      country: ["", [Validators.maxLength(50)]],
    });
    this.frmFeedback = this.fb.group({
      feedback: [null, [Validators.maxLength(50)]],
      businessAdminId: [""],
    });
  }

  customerInfo() {
    let bsModalRef: BsModalRef;
    const initialState = {
      locationId: this.locationId,
    };

    bsModalRef = this.modalService.show(CustomerInfoComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    bsModalRef.content.onClose.subscribe((result) => {});
  }

  editUserInfo(userId: number) {
    let bsModalRef: BsModalRef;

    const initialState = {
      userId,
      companyId: this.companyId,
      role: this.user.role,
    };

    bsModalRef = this.modalService.show(EditUserComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    bsModalRef.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }

  addUser() {
    let bsModalRef: BsModalRef;

    const initialState = {
      companyId: this.companyId,
      role: this.user.role,
    };

    bsModalRef = this.modalService.show(EditUserComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    bsModalRef.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
    this.ngOnInit();
  }

  getCompanyLogo(): string {
    let companyLogo: string = "";

    if (CommonUtility.isNotEmpty(this.userAuthService.getLocationLogo())) {
      companyLogo =
        this.basePath +
        "location/files/image/" +
        this.userAuthService.getLocationLogo();
    } else {
      companyLogo = "assets/images/No-image.png";
    }

    return companyLogo;
  }

  onSelectLogoFile(event) {
    this.logoUploader.uploadFiles({
      type: UploadType.LocationLogo,
      id: this.locationId.toString(),
    });
  }

  private logoUploadCompleted(item: any, response: any) {
    setTimeout(() => {
      this.updateLogoData();
    }, 500);
  }

  private uploadFailed() {
    this.notificationService.warning(
      "You are only allowed to upload jpg/jpeg/png files."
    );
  }

  removeLogo() {
    this.accountService.removeLogo(this.locationId).subscribe(
      (result: any) => {
        setTimeout(() => {
          this.updateLogoData();
        }, 500);
        this.notificationService.success("Location logo removed successfully.");
      },
      (error) => {}
    );
  }

  updateLogoData() {
    this.accountService.getById(this.locationId).subscribe(
      (data) => {
        if (data.image) {
          this.userAuthService.saveLocationLogo(data.image);
        } else {
          this.userAuthService.saveLocationLogo("");
        }
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

  brandingChange() {
    this.accountService.enableBranding(this.locationId).subscribe((result) => {
      this.ngOnInit();
    });
  }

  chattingChange() {
    this.accountService.enableChatting(this.locationId).subscribe((result) => {
      this.ngOnInit();
    });
  }
  waitlistSoundChange(e) {
    let user: User = this.user;
    user.waitlistSound = e.checked;
    this.accountService
      .enableWaitlistSound(this.user.id)
      .subscribe((result) => {
        window.localStorage.setItem(CommonConstant.user, JSON.stringify(user));
        this.ngOnInit();
      });
  }

  bookingSoundChange(e) {
    let user: User = this.user;
    user.bookingSound = e.checked;
    this.accountService.enableBookingSound(this.user.id).subscribe((result) => {
      window.localStorage.setItem(CommonConstant.user, JSON.stringify(user));
      this.ngOnInit();
    });
  }

  async openingInfo(locationId: number, status: string) {
    let bsModalRef: BsModalRef;

    if (this.bbCalendar && this.bbCalendar.length > 0) {
      this.bookingHoursData = this.bbCalendar;
    } else {
      this.fillBookingHours();
    }

    const initialState = {
      locationId,
      status,
      openingInfo: this.bookingHoursData,
    };

    bsModalRef = this.modalService.show(BookingHoursComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    bsModalRef.content.onClose.subscribe((result: BbCalendar[]) => {
      if (result) {
        this.bookingHoursData = result;
      } else {
        if (this.locationId && this.bbCalendar) {
          this.bbCalendar.forEach((element) => {
            var index = this.bookingHoursData.findIndex(
              (info) => info.weekDay === element.weekDay
            );
            this.bbCalendar[index] = element;
          });
          this.ngOnInit();
        } else {
          this.fillBookingHours();
        }
      }
    });
  }

  async fillBookingHours() {
    if (this.bbCalendar && this.bbCalendar.length > 0) {
      this.bookingHoursData = this.bbCalendar;
    } else {
      this.bookingHoursData = [];
      this.accountService.getWeekDays().subscribe(async (result) => {
        await result.forEach((weekDay) => {
          this.bookingHoursData.push({
            weekDay: weekDay,
            locationId: this.locationId,
            status: "All Day",
            startDate: this.frmCalendar.get("startDate").value,
            endDate: this.frmCalendar.get("endDate").value,
            slotMin: this.frmCalendar.get("slotMin").value,
            maxPartySize: this.frmCalendar.get("maxPartySize").value,
            bbTime: [
              {
                openTime: "08:00",
                closeTime: "10:00",
                bbSlot: [],
              },
            ],
          });
        });
      });
    }
  }

  private GetCalendarData() {
    this.publicService
      .getBbCalendarByLocationId(this.locationId)
      .subscribe((result: BbCalendar[]) => {
        if (result) {
          let newCalendar = result.find(
            (cal) => cal.status == "Open" || cal.status == "All Day"
          );
          if (newCalendar && newCalendar.bbTime) {
            this.frmCalendar.controls.maxPartySize.setValue(
              newCalendar.maxPartySize
            );
            this.frmCalendar.controls.slotMin.setValue(newCalendar.slotMin);
            this.slotMin = newCalendar.slotMin;
          }
        }
      });
  }

  slotChange(event) {
    this.frmCalendar.controls.slotMin.setValue(event.target.value);
  }

  saveTimeSlots() {
    let bsModalRef: BsModalRef;
    this.publicService
      .getBbAllBookingByLocationId(this.locationId)
      .subscribe((results) => {
        let temparry = results.filter((value) => {
          if (value.status == "Waiting") {
            return value;
          }
        });

        if (temparry && temparry.length > 0) {
          bsModalRef = this.modalService.show(DailogexampleComponent, {
            backdrop: true,
            ignoreBackdropClick: true,
            class: "modal-dialog-centered",
          });
          bsModalRef.content.onClose.subscribe((result) => {
            // console.log(result, "hssdsfhsdhcbhsdjdhfs");
            if (result) {
              this.publicService
                .cancelALlBooking(this.locationId)
                .subscribe((cancelResult) => {
                  if (cancelResult) {
                    return {
                      message: "all data canceld succesfully",
                    };
                  }
                });
            }
          });
        }
      });
  }

  createBbBooking() {
    this.bookingHoursData.forEach((calander) =>
      this.accountService.createBbCalendar(calander).subscribe((result) => {})
    );
  }

  storeBookingChange(status) {
    if (this.bbCalendar?.length || status.checked == false) {
      this.accountService
        .enableStoreBooking(this.locationId)
        .subscribe((result) => {
          this.ngOnInit();
        });
    } else {
      status.source.checked = false;
      this.notificationService.warning("Please add opening hours");
    }
  }
  isStoreBooking() {
    return this.storeBooking;
  }
  isBookingsDisabled() {
    return this.bbCalendar.length ? false : true;
  }
  changeCalDate(e) {
    this.frmCalendar.get("endDate").setValue(addDays(new Date(e), 6));
  }

  expandTiming() {
    this.timingsCollapse = !this.timingsCollapse;
  }
}
