import { Component, OnInit } from "@angular/core";
import { UserAuthService, CommonUtility, NotificationService } from "@app-core";
import { User, Location, SpotData } from "@app-models";
import { environment } from "src/environments/environment";

import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

import { PartySizeModalComponent } from "@app-shared";
import { FeedbackComponent } from "../dashboard/feedback/feedback.component";
import { DashboardService } from "../dashboard/dashboard.service";
import { AccountService } from "../account/account.service";
import { Router } from "@angular/router";
import { HelperService } from "src/app/public/services/helper/helper.service";
import { ProfileService } from "../profile/profile.service";
@Component({
  templateUrl: "./latestspot.component.html",
  styleUrls: ["./latestspot.component.css"],
})
export class LatestspotComponent implements OnInit {
  spotData: SpotData[] = [];
  page: number = 1;
  locationId: number = 0;
  locationData: Location[] = [];
  locationLongitude;
  locationLatitude;
  isActivate: boolean = false;
  activateButtonText: string = "ACTIVATE";
  storeUniqueId: string;
  value: string;
  userName: string;
  bsModalRef: BsModalRef;
  dataRefresher: NodeJS.Timeout;

  companyName: string;
  isSuperAdmin: any;
  isBusinessOwner: any;
  companyId: number;
  url: string;

  constructor(
    private dashboardService: DashboardService,
    private userAuthService: UserAuthService,
    private notificationService: NotificationService,
    private modalService: BsModalService,
    private router: Router,
    private helperService: HelperService,
    private profileService: ProfileService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.url = window.location.origin;
    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
    this.helperService.isRefresh().subscribe((res) => {
      if (res == true) {
        this.getSpotData();
        this.joinAlert();
      }
    });
    this.getLocations();
  }
  joinAlert() {
    let audio: HTMLAudioElement = new Audio(
      "../../../assets/sound/toast_sound.mp3"
    );
    this.notificationService.info("New Spot joined!");
    if (this.userAuthService.getUser().waitlistSound) {
      audio.play();
    }
  }
  getSpotData() {
    this.spotData = [];
    if (CommonUtility.isNotEmpty(this.locationId)) {
      this.dashboardService.getSpotData(this.locationId).subscribe(
        (result) => {
          let latestSpotData = [];
          latestSpotData = latestSpotData.concat(
            result.filter((t) => t.status === "Serving")
          );
          latestSpotData = latestSpotData.concat(
            result.filter((t) => t.status === "Waiting")
          );
          latestSpotData = latestSpotData.concat(
            result.filter((t) => t.status === "Resolved")
          );
          latestSpotData = latestSpotData.concat(
            result.filter((t) => t.status === "Cancelled")
          );
          this.spotData = latestSpotData;
        },
        (error) => {}
      );
    }
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
      this.locationLongitude = location.longitude;
      this.locationLatitude = location.latitude;
      this.isActivate = location.isActive;
      this.activateButtonText = location.isActive ? "DEACTIVATE" : "ACTIVATE";
      this.storeUniqueId = location.qrCodeURL.toString();
      this.value = `${environment.webUrl}/reservespot/${this.storeUniqueId}`;

      this.getSpotData();
    }
  }

  checkIn(id: number, partySize: number) {
    if (!partySize || partySize === 0) {
      partySize = 1;
    }

    this.dashboardService.checkIn(id, partySize).subscribe(
      (result) => {
        this.notificationService.success("Successfully Checked In.");
        this.helperService.waitList(true, id);
        this.getSpotData();
      },
      (error) => {
        this.notificationService.error(
          "Something went wrong. Please try again."
        );
      }
    );
  }
  checkOut(id: number) {
    this.dashboardService.checkOut(id).subscribe(
      (result) => {
        this.notificationService.success("Successfully Checked Out.");
        this.helperService.waitList(true, id);
        this.getSpotData();
      },
      (error) => {
        this.notificationService.error(
          "Something went wrong. Please try again."
        );
      }
    );
  }

  skip(id: number) {
    this.dashboardService.skip(id).subscribe(
      (result) => {
        this.notificationService.success("Successfully Skipped.");
        this.helperService.waitList(true, id);
        this.getSpotData();
      },
      (error) => {
        this.notificationService.error(
          "Something went wrong. Please try again."
        );
      }
    );
  }

  notify(id: number) {}

  cancel(id: number) {
    this.dashboardService.cancel(id).subscribe(
      (result) => {
        this.notificationService.success("Successfully Cancelled.");
        this.getSpotData();
      },
      (error) => {
        this.notificationService.error(
          "Something went wrong. Please try again."
        );
      }
    );
  }

  changePartySize(item: SpotData) {
    const initialState = {
      partySize: item.partySize,
    };

    this.bsModalRef = this.modalService.show(PartySizeModalComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });

    this.bsModalRef.content.onClose.subscribe((result: any) => {
      item.partySize = result.partySize;

      this.dashboardService.updatePartySize(item.id, item.partySize).subscribe(
        (result) => {
          this.notificationService.success("Party size updated successfully.");
          this.ngOnInit();
        },
        (error) => {}
      );
    });
  }

  feedback(item: SpotData) {
    this.userName = "";

    if (item.user.name) this.userName += item.user.name;

    const initialState = {
      booking: item,
    };

    this.bsModalRef = this.modalService.show(FeedbackComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
      class: "modal-lg",
    });

    this.bsModalRef.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }

  getLocations() {
    this.spotData = [];
    this.value = "";
    this.isActivate = false;
    this.activateButtonText = "ACTIVATE";
    this.storeUniqueId = "";
    this.companyName = "";
    this.companyId = Number(this.userAuthService.getCompanyName());
    if (this.isSuperAdmin || this.isBusinessOwner) {
      this.accountService
        .getLocationsByCompany(this.companyId)
        .subscribe((result) => {
          this.locationData = result;
          if (this.isSuperAdmin) {
            this.locationData = this.locationData.filter(
              (t) => t.businessAdminId === this.companyId
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
                (loc) =>
                  loc.id === Number(this.userAuthService.getLocationName())
              )
            ) {
              this.locationId = Number(this.userAuthService.getLocationName());
            } else {
              this.locationId = this.locationData[0].id;
            }
            this.selectLocation();
          } else if (
            this.isBusinessOwner &&
            CommonUtility.isEmpty(this.locationData)
          ) {
            this.notificationService.info("Please add store details");
            this.router.navigateByUrl("secure/account/store/new");
            return;
          } else {
          }
        });
    } else {
      this.locationData = [];
      const user: User = this.userAuthService.getUser();

      if (CommonUtility.isNotEmpty(user)) {
        this.profileService.getById(user.id).subscribe((userData: User) => {
          if (
            CommonUtility.isNotEmpty(userData) &&
            CommonUtility.isNotEmpty(userData.locationAdmin)
          ) {
            this.locationData.push(userData.locationAdmin[0]);
            if (this.userAuthService.getLocationName()) {
              this.locationId = Number(this.userAuthService.getLocationName());
            } else {
              this.locationId = this.locationData[0].id;
            }
            this.selectLocation();
          }
        });
      }
    }
    // this.dataRefresher = setInterval(() => {
    this.getSpotData();
    // }, 15000);
  }

  pageChanged(event) {
    this.page = event;
  }
}
