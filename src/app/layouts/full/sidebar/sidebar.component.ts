import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { MediaMatcher } from "@angular/cdk/layout";
import { MenuItems } from "../../../shared/menu-items/menu-items";
import {
  UserAuthService,
  APIConstant,
  CommonUtility,
  NotificationService,
} from "@app-core";
import { User } from "@app-models";
import { Router } from "@angular/router";
import { AccountService } from "src/app/secure/account/account.service";

enum Tabs {
  Profile,
  Account,
  Pricing,
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: [],
})
export class AppSidebarComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  basePath: string = APIConstant.basePath + "api/";
  tabs = Tabs;
  currentTab: number = Tabs.Profile;
  isSuperAdmin: boolean = false;
  isBusinessOwner: boolean = false;
  isStoreSupport: boolean = false;
  isManager: boolean = false;
  showBilling: boolean = false;
  companyId: number = 0;
  private _mobileQueryListener: () => void;
  locationId: number;
  locationData: any;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private router: Router,
    public menuItems: MenuItems,
    private userAuthService: UserAuthService,
    private notificationService: NotificationService,
    private accountService: AccountService
  ) {
    this.mobileQuery = media.matchMedia("(min-width: 768px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
    this.isStoreSupport = this.userAuthService.isStoreSupport();
    this.isManager = this.userAuthService.isManager();

    this.showBilling = false;
    if (this.isBusinessOwner && !this.isManager) {
      this.showBilling = true;
    }
    this.getCompanies();
  }

  getCompanies() {
    if (this.isSuperAdmin) {
      this.companyId = Number(this.userAuthService.getCompanyName());
      this.getLocations();
    } else if (this.isBusinessOwner) {
      if (this.userAuthService.getCompanyName()) {
        this.companyId = Number(this.userAuthService.getCompanyName());
      } else {
        this.companyId = this.userAuthService.getUser().id;
      }
      this.getLocations();
    } else {
      if (this.userAuthService.getCompanyName()) {
        this.companyId = Number(this.userAuthService.getCompanyName());
      } else {
        this.companyId = this.userAuthService.getUser().reportTo;
      }
      this.getLocations();
    }
  }

  getLocations() {
    if (this.isSuperAdmin || this.isBusinessOwner) {
      this.accountService
        .getLocationsByCompany(this.companyId)
        .subscribe((result) => {
          this.locationData = result;
          if (CommonUtility.isNotEmpty(this.locationData)) {
            if (this.userAuthService.getLocationName()) {
              this.locationId = Number(this.userAuthService.getLocationName());
            } else {
              this.locationId = this.locationData[0].id;
            }
          }
        });
    }
  }
  dashboard() {
    if (this.isBusinessOwner && CommonUtility.isEmpty(this.locationData)) {
      this.accountService
        .getLocationsByCompany(this.companyId)
        .subscribe((result) => {
          // console.log(result, "dashboard result");

          this.locationData = result;
          if (CommonUtility.isNotEmpty(this.locationData)) {
            this.router.navigateByUrl("secure/dashboard");
          } else {
            this.notificationService.info("Please add store details");
            this.router.navigateByUrl("secure/account/store/new");
          }
        });
    } else {
      this.router.navigateByUrl("secure/dashboard");
    }
  }

  store() {
    this.getLocations();
    if (this.userAuthService.isBusinessAdmin()) {
      this.router.navigateByUrl("secure/account/store/new");
    }
    if (this.userAuthService.isSuperAdmin()) {
      this.router.navigateByUrl("secure/account/store");
    }
  }

  activity() {
    if (this.isBusinessOwner && CommonUtility.isEmpty(this.locationData)) {
      this.accountService
        .getLocationsByCompany(this.companyId)
        .subscribe((result) => {
          this.locationData = result;
          if (CommonUtility.isNotEmpty(this.locationData)) {
            this.router.navigateByUrl("secure/activity/list");
          } else {
            this.notificationService.info("Please add store details");
            this.router.navigateByUrl("secure/account/store/new");
          }
        });
    } else {
      this.router.navigateByUrl("secure/activity/list");
    }
  }

  chat() {
    if (this.userAuthService.isBusinessAdmin()) {
      this.router.navigateByUrl("secure/adminchat");
    }
    if (this.userAuthService.isSuperAdmin()) {
      this.router.navigateByUrl("secure/adminchat");
    }
  }

  customerchat() {
    if (this.userAuthService.isStoreSupport()) {
      this.router.navigateByUrl("secure/customerchat");
    }
  }

  chats() {
    if (this.userAuthService.isBusinessAdmin()) {
      this.router.navigateByUrl("secure/employeechat");
    }
    if (!this.userAuthService.isSuperAdmin()) {
      this.router.navigateByUrl("secure/employeechat");
    }
  }

  settings() {
    if (this.isBusinessOwner && CommonUtility.isEmpty(this.locationData)) {
      this.accountService
        .getLocationsByCompany(this.companyId)
        .subscribe((result) => {
          this.locationData = result;

          if (CommonUtility.isNotEmpty(this.locationData)) {
            this.router.navigateByUrl("secure/account/settings");
          } else {
            this.notificationService.info("Please add store details");
            this.router.navigateByUrl("secure/account/store/new");
          }
        });
    } else {
      this.router.navigateByUrl("secure/account/settings");
    }
  }
  pricing() {
    if (this.userAuthService.isBusinessAdmin()) {
      this.router.navigateByUrl("secure/pricing");
    }
  }
  inquiries() {
    if (this.userAuthService.isSuperAdmin()) {
      this.router.navigateByUrl("secure/inquiry");
    }
  }
  locationAdmins() {
    if (this.userAuthService.isSuperAdmin()) {
      this.router.navigateByUrl("secure/locationadmins");
    }
  }

  latestSpot() {
    if (this.isBusinessOwner && CommonUtility.isEmpty(this.locationData)) {
      this.accountService
        .getLocationsByCompany(this.companyId)
        .subscribe((result) => {
          this.locationData = result;
          if (CommonUtility.isNotEmpty(this.locationData)) {
            if (
              this.userAuthService.isBusinessAdmin() ||
              this.userAuthService.isManager() ||
              this.userAuthService.isStoreSupport()
            ) {
              this.router.navigateByUrl("secure/latestspot");
            }
          } else {
            this.notificationService.info("Please add store details");
            this.router.navigateByUrl("secure/account/store/new");
          }
        });
    } else {
      if (
        this.userAuthService.isBusinessAdmin() ||
        this.userAuthService.isManager() ||
        this.userAuthService.isStoreSupport()
      ) {
        this.router.navigateByUrl("secure/latestspot");
      }
    }
  }

  bookings() {
    if (this.isBusinessOwner && CommonUtility.isEmpty(this.locationData)) {
      this.accountService
        .getLocationsByCompany(this.companyId)
        .subscribe((result) => {
          this.locationData = result;
          if (CommonUtility.isNotEmpty(this.locationData)) {
            if (
              this.userAuthService.isBusinessAdmin() ||
              this.userAuthService.isManager() ||
              this.userAuthService.isStoreSupport()
            ) {
              this.router.navigateByUrl("secure/bookinglist");
            }
          } else {
            this.notificationService.info("Please add store details");
            this.router.navigateByUrl("secure/account/store/new");
          }
        });
    } else {
      if (
        this.userAuthService.isBusinessAdmin() ||
        this.userAuthService.isManager() ||
        this.userAuthService.isStoreSupport()
      ) {
        this.router.navigateByUrl("secure/bookinglist");
      }
    }
  }

  tabClick(tab: number) {
    this.currentTab = tab;

    switch (this.currentTab) {
      case this.tabs.Profile:
        this.router.navigateByUrl(`secure/profile`);
        break;
      case this.tabs.Account:
        this.router.navigateByUrl(`secure/account`);
        break;
      case this.tabs.Pricing:
        this.router.navigateByUrl(`secure/pricing`);
        break;
    }
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

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
