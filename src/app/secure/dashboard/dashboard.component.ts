import { Component, OnInit } from "@angular/core";
import { ChartOptions, ChartType, ChartDataSets, controllers } from "chart.js";
import { Label } from "ng2-charts";
import {
  UserAuthService,
  CommonUtility,
  NotificationService,
  APIConstant,
} from "@app-core";
import {
  WaittimeChart,
  WaittimeChartLocationData,
  List,
  User,
  Location,
  WaittimeChartParameter,
  DashboardCounts,
  SpotData,
  EndUser,
  LocationInput,
  UserInput,
  BbBookingCount,
} from "@app-models";
import { DatePipe } from "@angular/common";
import { ProfileService } from "../profile/profile.service";
import { AccountService } from "../account/account.service";
import { environment } from "src/environments/environment";
import { DashboardService } from "./dashboard.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { PartySizeModalComponent, ValidationService } from "@app-shared";
import { FeedbackComponent } from "./feedback/feedback.component";
import { Router } from "@angular/router";
import { ReserveSpotComponent } from "./reserve-spot/reserve-spot.component";
import { BookingInfoComponent } from "./booking_info/booking_info.component";
import { ActivityMapComponent } from "./activity_map/activity_map.component";
import QRCodeStyling from "qr-code-styling";
import { HelperService } from "src/app/public/services/helper/helper.service";
import { PublicService } from "src/app/public/public.service";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { BbBookingComponent } from "./bb-booking/bb-booking.component";
import { EncrDecrServiceService } from "src/app/service/encr-decr-service.service";
import { debug } from "console";

@Component({
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  basePath: string = APIConstant.basePath + "api/";
  isSuperAdmin: boolean = false;
  isBusinessOwner: boolean = false;
  isManager: boolean = false;
  url: string;
  value: string;
  isActivate: boolean = false;
  activateButtonText: string = "ACTIVATE";
  storeUniqueId: string;
  companyName: string;
  userName: string = "";
  activateText: string = "";
  backgroundColor: string[] = [
    "rgba(255,99,132,0.6)",
    "rgba(54,162,235,0.6)",
    "rgba(255,206,86,0.6)",
    "rgba(231,233,237,0.6)",
    "rgba(75,192,192,0.6)",
    "rgba(151,187,205,0.6)",
    "rgba(220,220,220,0.6)",
    "rgba(247,70,74,0.6)",
    "rgba(70,191,189,0.6)",
    "rgba(253,180,92,0.6)",
  ];
  borderColor: string[] = [
    "rgba(255,99,132,1)",
    "rgba(54,162,235,1)",
    "rgba(255,206,86,1)",
    "rgba(231,233,237,1)",
    "rgba(75,192,192,1)",
    "rgba(151,187,205,1)",
    "rgba(220,220,220,1)",
    "rgba(247,70,74,1)",
    "rgba(70,191,189,1)",
    "rgba(253,180,92,1)",
  ];
  hoverBackgroundColor: string[] = [
    "rgba(255,99,132,0.8)",
    "rgba(54,162,235,0.8)",
    "rgba(255,206,86,0.8)",
    "rgba(231,233,237,0.8)",
    "rgba(75,192,192,0.8)",
    "rgba(151,187,205,0.8)",
    "rgba(220,220,220,0.8)",
    "rgba(247,70,74,0.8)",
    "rgba(70,191,189,0.8)",
    "rgba(253,180,92,0.8)",
  ];
  hoverBorderColor: string[] = [
    "rgba(255,99,132,1)",
    "rgba(54,162,235,1)",
    "rgba(255,206,86,1)",
    "rgba(231,233,237,1)",
    "rgba(75,192,192,1)",
    "rgba(151,187,205,1)",
    "rgba(220,220,220,1)",
    "rgba(247,70,74,1)",
    "rgba(70,191,189,1)",
    "rgba(253,180,92,1)",
  ];
  loading: boolean;
  dashboardCounts: DashboardCounts = new DashboardCounts();
  bbBookingCount: BbBookingCount = new BbBookingCount();
  spotData: SpotData[] = [];
  page: number = 1;
  waittimeChartData: WaittimeChart[] = [];
  public barChartType: ChartType = "bar";
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = [];
  public barChartData: ChartDataSets[] = [];
  public barChartTypeMonthly: ChartType = "bar";
  public barChartLegendMonthly = true;
  public barChartPluginsMonthly = [];
  public barChartOptionsMonthly: ChartOptions = {
    responsive: true,
  };
  public barChartLabelsMonthly: Label[] = [];
  public barChartDataMonthly: ChartDataSets[] = [];
  public barChartTypeYearly: ChartType = "bar";
  public barChartLegendYearly = true;
  public barChartPluginsYearly = [];
  public barChartOptionsYearly: ChartOptions = {
    responsive: true,
  };
  public barChartLabelsYearly: Label[] = [];
  public barChartDataYearly: ChartDataSets[] = [];
  public barChartTypeDay: ChartType = "bar";
  public barChartLegendDay = true;
  public barChartPluginsDay = [];
  public barChartOptionsDay: ChartOptions = {
    responsive: true,
  };
  public barChartLabelsDay: Label[] = [];
  public barChartDataDay: ChartDataSets[] = [];
  intervalType: string = "month";
  axisX: string;
  frmUser: FormGroup = new FormGroup({});
  companyId: number;
  companyData: List[];
  locationId: number = 0;
  locationData: Location[] = [];
  locationinputData: LocationInput[];
  bsModalRef: BsModalRef;
  locationLongitude;
  locationLatitude;
  qrCode;
  dataRefresher: any;
  isUserFormSubmitted: boolean;
  error: any;
  userInputDetails: UserInput[];
  frmUserInput: Array<any> = [];
  selectedUser;
  IsmodelShow: boolean = true;
  storeBooking: boolean;

  constructor(
    private userAuthService: UserAuthService,
    private dashboardService: DashboardService,
    private profileService: ProfileService,
    private publicService: PublicService,
    private accountService: AccountService,
    private datepipe: DatePipe,
    private helperService: HelperService,
    // private encrDecrService: EncrDecrServiceService,
    private notificationService: NotificationService,
    private router: Router,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    this.createForm();
    this.locationinputData = [];
  }
  ngOnInit() {
    this.refreshData();
    this.url = window.location.origin;
    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
    this.isManager = this.userAuthService.isManager();
    if (this.userAuthService.getUser().locationAdmin) {
      this.router.navigateByUrl("secure/account/add");
    }
    this.getCompanies();
  }
  refreshData() {
    this.helperService.isRefresh().subscribe((res) => {
      if (res == true) {
        this.getSpotData();
        this.getDashboardCounts();
        this.getStaticChartData();
        this.getWaittimeChartData();
        this.joinAlert();
      }
    });
    this.helperService.bbBooking_isRefresh().subscribe((res) => {
      if (res) {
        this.getDashboardCounts();
        this.joinAlert();
      }
    });
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
  bookingAlert() {
    let audio: HTMLAudioElement = new Audio(
      "../../../assets/sound/toast_sound.mp3"
    );
    this.notificationService.info("New Slot Booked");

    if (this.userAuthService.getUser().waitlistSound) {
      audio.play();
    }
  }
  getCompanies() {
    this.companyData = [];
    if (this.isSuperAdmin) {
      this.profileService.getProfiles().subscribe((result: User[]) => {
        if (CommonUtility.isNotEmpty(result)) {
          result.forEach((user: User) => {
            if (CommonUtility.isNotEmpty(user.companyName)) {
              this.companyData.push({
                id: user.id,
                name: user.companyName,
                logo: user.logo,
              });
            }
          });
          if (this.userAuthService.getCompanyName()) {
            this.companyId = Number(this.userAuthService.getCompanyName());
          } else {
            this.companyId = this.companyData[0].id;
          }
          this.getLocations();
        }
      });
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
  createForm() {
    this.frmUser = this.fb.group({
      name: ["", [Validators.maxLength(50)]],
      email: ["", [ValidationService.emailValidator, Validators.maxLength(50)]],
      phone: ["", [Validators.maxLength(20)]],
      userInput: [[]],
    });
  }
  valueChange(value) {}
  updateUser() {
    this.locationinputData;
    let id = 0;
    if (this.selectedUser && this.selectedUser.id > 0) {
      id = this.selectedUser.id;
    }

    this.isUserFormSubmitted = true;

    if (!this.frmUser.valid) {
      return;
    }

    this.error = null;

    if (this.locationinputData) {
      this.locationinputData.forEach((customLocationInput) => {
        this.frmUserInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmUser.get(customLocationInput.name).value,
        });
      });
    }

    this.frmUser.get("userInput").setValue(this.frmUserInput);
    const data: EndUser = this.frmUser.value;

    if (id > 0) {
      this.publicService.endUserUpdate(id, data).subscribe(
        (result) => {
          this.notificationService.success("Details updated successfully!!");
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
    this.close();
  }
  getLocations() {
    this.barChartLabels = [];
    this.barChartData = [];
    this.spotData = [];

    this.value = "";
    this.isActivate = false;
    this.activateButtonText = "ACTIVATE";
    this.storeUniqueId = "";
    this.companyName = "";

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

          if (this.locationinputData) {
            this.locationinputData.forEach((customLocationInput) => {
              this.frmUser.addControl(
                customLocationInput.name,
                new FormControl("")
              );
              if (customLocationInput.required) {
                this.frmUser
                  .get(customLocationInput.name)
                  .setValidators([Validators.required]);
                this.frmUser
                  .get(customLocationInput.name)
                  .updateValueAndValidity();
              }
              if (
                customLocationInput.type === "Selection" &&
                customLocationInput.multiple
              ) {
                customLocationInput.defaultValue =
                  customLocationInput.defaultInput.split(",");
              }
            });
          }
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
            this.getWaittimeChartData();
            this.getWaittimeChartDatamonthly();
            this.getWaittimeChartDataYearly();
            this.getWaittimeChartDataDay();
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
            this.getWaittimeChartData();
            this.getWaittimeChartDatamonthly();
            this.getWaittimeChartDataYearly();
            this.getWaittimeChartDataDay();
          }
        });
      }
    }
    // this.dataRefresher = setInterval(() => {
    this.getSpotData();
    // }, 15000);
  }
  // cancelPageRefresh() {
  //   if (this.dataRefresher) {
  //     clearInterval(this.dataRefresher);
  //   }
  // }
  // ngOnDestroy() {
  //   this.cancelPageRefresh();
  // }
  selectLocation() {
    if (CommonUtility.isNotEmpty(this.locationId)) {
      var location: Location = this.locationData.find(
        (t) => t.id == this.locationId
      );
      this.userAuthService.saveLocation(this.locationId.toString());
      if (location.image) {
        this.userAuthService.saveLocationLogo(location.image);
      } else {
        this.userAuthService.saveLocationLogo("");
      }

      this.locationinputData = location.locationInput.filter(
        (u) =>
          u.availableFor === "User" &&
          u.isDeleted === false &&
          u.enabled === true
      );

      this.locationLongitude = location.longitude;
      this.locationLatitude = location.latitude;
      this.isActivate = location.isActive;
      this.storeBooking = location.storeBooking;
      this.activateButtonText = location.isActive ? "DEACTIVATE" : "ACTIVATE";
      this.storeUniqueId = location.qrCodeURL.toString();
      //if store booking is enabled than choose booking route or normal waitlist

      this.value = `${environment.webUrl}/selectmode/${this.storeUniqueId}`;

      if (location.image) {
        this.getQRCode(
          this.basePath + "location/files/image/" + location.image,
          location.theme
        );
      } else {
        this.getQRCode("", "unset");
      }
      this.getDashboardCounts();
      this.getSpotData();
    }
  }
  getQRCode(image: string, theme: string) {
    this.qrCode = new QRCodeStyling({
      width: 180,
      height: 180,
      data: this.value,
      image: image,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
      },
      dotsOptions: {
        color: theme === "unset" ? "#000" : theme,
        type: "rounded",
      },
    });
    document.getElementById("canvas").innerHTML = "";
    this.qrCode.append(document.getElementById("canvas"));
  }
  getDashboardCounts() {
    this.dashboardCounts = new DashboardCounts();

    if (CommonUtility.isNotEmpty(this.locationId)) {
      this.dashboardService.getDashboardCounts(this.locationId).subscribe(
        (result: DashboardCounts) => {
          if (CommonUtility.isNotEmpty(result)) {
            this.dashboardCounts = result;
          }
        },
        (error) => {}
      );
      this.dashboardService
        .getBbBookingDashboardCounts(this.locationId)
        .subscribe(
          (result: BbBookingCount) => {
            if (CommonUtility.isNotEmpty(result)) {
              this.bbBookingCount = result;
            }
          },
          (error) => {}
        );
    }
  }
  getStaticChartData() {
    this.barChartLabels = [];
    this.barChartData = [];

    this.waittimeChartData.forEach((item: WaittimeChart) => {
      this.barChartLabels.push(item.date);

      item.data.forEach((location: WaittimeChartLocationData) => {
        if (this.barChartData.some((t) => t.label === location.locationName)) {
          this.barChartData
            .find((t) => t.label === location.locationName)
            .data.push(location.avgWaitTime);
        } else {
          this.barChartData.push({
            data: [location.avgWaitTime],
            label: location.locationName,
          });
        }
      });
    });
  }
  getWaittimeChartData() {
    this.barChartLabels = [];
    this.barChartData = [];

    let fromDate: Date, toDate: Date;
    toDate = new Date();
    fromDate = this.addDays(toDate, -6);

    let parameter = new WaittimeChartParameter();
    parameter.fromDate = this.datepipe.transform(fromDate, "yyyy-MM-dd");
    parameter.toDate = this.datepipe.transform(toDate, "yyyy-MM-dd");

    this.dashboardService
      .getWaittimeChartData(this.companyId, parameter)
      .subscribe(
        (result: WaittimeChart[]) => {
          if (this.isSuperAdmin || this.isBusinessOwner) {
            this.locationData.forEach((location: Location, i) => {
              this.barChartData.push({
                data: [],
                label: location.name,
                backgroundColor: this.backgroundColor[i % 5],
                borderColor: this.borderColor[i % 5],
                hoverBackgroundColor: this.hoverBackgroundColor[i % 5],
                hoverBorderColor: this.hoverBorderColor[i % 5],
              });
            });
          } else {
            if (this.locationData.some((t) => t.id === this.locationId)) {
              this.barChartData.push({
                data: [],
                label: this.locationData.find((t) => t.id === this.locationId)
                  .name,
                backgroundColor: this.backgroundColor[0],
                borderColor: this.borderColor[0],
                hoverBackgroundColor: this.hoverBackgroundColor[0],
                hoverBorderColor: this.hoverBorderColor[0],
              });
            }
          }
          while (fromDate <= toDate) {
            this.barChartLabels.push(
              this.datepipe.transform(fromDate, "d MMM").toUpperCase()
            );

            var chartData: WaittimeChart = result.find(
              (t) => t.date === this.datepipe.transform(fromDate, "yyyy-MM-dd")
            );
            if (CommonUtility.isNotEmpty(chartData)) {
              this.locationData.forEach((location: Location) => {
                if (
                  CommonUtility.isNotEmpty(chartData.data) &&
                  chartData.data.some((t) => t.locationName === location.name)
                ) {
                  let avgWaitTime: number = Number(
                    chartData.data.find((t) => t.locationName === location.name)
                      .avgWaitTime
                  );
                  this.barChartData
                    .find((t) => t.label === location.name)
                    .data.push(avgWaitTime);
                } else {
                  this.barChartData
                    .find((t) => t.label === location.name)
                    .data.push(0);
                }
              });
            } else {
              this.locationData.forEach((location: Location) => {
                this.barChartData
                  .find((t) => t.label === location.name)
                  .data.push(0);
              });
            }

            fromDate = this.addDays(fromDate, 1);
          }
        },
        (error) => {}
      );
  }
  getWaittimeChartDatamonthly() {
    this.barChartLabelsMonthly = [];
    this.barChartDataMonthly = [];
    let fromDate: Date, toDate: Date;
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    fromDate = firstDay;
    toDate = lastDay;
    let parameter = new WaittimeChartParameter();
    parameter.fromDate = this.datepipe.transform(fromDate, "yyyy-MM-dd");
    parameter.toDate = this.datepipe.transform(toDate, "yyyy-MM-dd");
    this.dashboardService
      .getWaittimeChartDatamonthly(this.companyId, parameter)
      .subscribe(
        (result: WaittimeChart[]) => {
          if (this.isSuperAdmin || this.isBusinessOwner) {
            this.locationData.forEach((location: Location, i) => {
              this.barChartDataMonthly.push({
                data: [],
                label: location.name,
                backgroundColor: this.backgroundColor[i % 5],
                borderColor: this.borderColor[i % 5],
                hoverBackgroundColor: this.hoverBackgroundColor[i % 5],
                hoverBorderColor: this.hoverBorderColor[i % 5],
              });
            });
          } else {
            if (this.locationData.some((t) => t.id === this.locationId)) {
              this.barChartDataMonthly.push({
                data: [],
                label: this.locationData.find((t) => t.id === this.locationId)
                  .name,
                backgroundColor: this.backgroundColor[0],
                borderColor: this.borderColor[0],
                hoverBackgroundColor: this.hoverBackgroundColor[0],
                hoverBorderColor: this.hoverBorderColor[0],
              });
            }
          }
          while (fromDate <= toDate) {
            this.barChartLabelsMonthly.push(
              this.datepipe.transform(fromDate, "d MMM").toUpperCase()
            );

            var chartDataMonthly: WaittimeChart = result.find(
              (t) => t.date === this.datepipe.transform(fromDate, "yyyy-MM-dd")
            );
            if (CommonUtility.isNotEmpty(chartDataMonthly)) {
              this.locationData.forEach((location: Location) => {
                if (
                  CommonUtility.isNotEmpty(chartDataMonthly.data) &&
                  chartDataMonthly.data.some(
                    (t) => t.locationName === location.name
                  )
                ) {
                  let avgWaitTime: number = Number(
                    chartDataMonthly.data.find(
                      (t) => t.locationName === location.name
                    ).avgWaitTime
                  );
                  this.barChartDataMonthly
                    .find((t) => t.label === location.name)
                    .data.push(avgWaitTime);
                } else {
                  this.barChartDataMonthly
                    .find((t) => t.label === location.name)
                    .data.push(0);
                }
              });
            } else {
              this.locationData.forEach((location: Location) => {
                this.barChartDataMonthly
                  .find((t) => t.label === location.name)
                  .data.push(0);
              });
            }
            fromDate = this.addDays(fromDate, 1);
          }
        },
        (error) => {}
      );
  }
  getWaittimeChartDataYearly() {
    this.barChartLabelsYearly = [];
    this.barChartDataYearly = [];

    let fromDate: Date, toDate: Date;

    var start_date = new Date(new Date().getFullYear(), 0);
    var end_date = new Date(new Date().getFullYear(), 11, 31);

    toDate = end_date;
    fromDate = start_date;

    let parameter = new WaittimeChartParameter();
    parameter.fromDate = this.datepipe.transform(fromDate, "yyyy-MM-dd");
    parameter.toDate = this.datepipe.transform(toDate, "yyyy-MM-dd");

    this.dashboardService
      .getWaittimeChartDataYearly(this.companyId, parameter)
      .subscribe(
        (result: WaittimeChart[]) => {
          if (this.isSuperAdmin || this.isBusinessOwner) {
            this.locationData.forEach((location: Location, i) => {
              this.barChartDataYearly.push({
                data: [],
                label: location.name,
                backgroundColor: this.backgroundColor[i % 5],
                borderColor: this.borderColor[i % 5],
                hoverBackgroundColor: this.hoverBackgroundColor[i % 5],
                hoverBorderColor: this.hoverBorderColor[i % 5],
              });
            });
          } else {
            if (this.locationData.some((t) => t.id === this.locationId)) {
              this.barChartDataYearly.push({
                data: [],
                label: this.locationData.find((t) => t.id === this.locationId)
                  .name,
                backgroundColor: this.backgroundColor[0],
                borderColor: this.borderColor[0],
                hoverBackgroundColor: this.hoverBackgroundColor[0],
                hoverBorderColor: this.hoverBorderColor[0],
              });
            }
          }
          while (fromDate <= toDate) {
            this.barChartLabelsYearly.push(
              this.datepipe.transform(fromDate, "d MMM").toUpperCase()
            );

            var chartDataYearly: WaittimeChart = result.find(
              (t) => t.date === this.datepipe.transform(fromDate, "yyyy-MM-dd")
            );
            if (CommonUtility.isNotEmpty(chartDataYearly)) {
              this.locationData.forEach((location: Location) => {
                if (
                  CommonUtility.isNotEmpty(chartDataYearly.data) &&
                  chartDataYearly.data.some(
                    (t) => t.locationName === location.name
                  )
                ) {
                  let avgWaitTime: number = Number(
                    chartDataYearly.data.find(
                      (t) => t.locationName === location.name
                    ).avgWaitTime
                  );
                  this.barChartDataYearly
                    .find((t) => t.label === location.name)
                    .data.push(avgWaitTime);
                } else {
                  this.barChartDataYearly
                    .find((t) => t.label === location.name)
                    .data.push(0);
                }
              });
            } else {
              this.locationData.forEach((location: Location) => {
                this.barChartDataYearly
                  .find((t) => t.label === location.name)
                  .data.push(0);
              });
            }
            fromDate = this.addDays(fromDate, 1);
          }
        },
        (error) => {}
      );
  }
  getWaittimeChartDataDay() {
    this.barChartLabelsDay = [];
    this.barChartDataDay = [];
    let fromDate: Date, toDate: Date;
    let start_time = new Date();
    start_time.setHours(0, 0, 0, 0);
    let end_time = new Date();
    end_time.setHours(23, 59, 59, 999);
    fromDate = start_time;
    toDate = end_time;
    let parameter = new WaittimeChartParameter();
    parameter.fromDate = this.datepipe.transform(fromDate, "yyyy-MM-dd");
    parameter.toDate = this.datepipe.transform(toDate, "yyyy-MM-dd");
    this.dashboardService
      .getWaittimeChartDataDay(this.companyId, parameter)
      .subscribe(
        (result: WaittimeChart[]) => {
          if (this.isSuperAdmin || this.isBusinessOwner) {
            this.locationData.forEach((location: Location, i) => {
              this.barChartDataDay.push({
                data: [],
                label: location.name,
                backgroundColor: this.backgroundColor[i % 5],
                borderColor: this.borderColor[i % 5],
                hoverBackgroundColor: this.hoverBackgroundColor[i % 5],
                hoverBorderColor: this.hoverBorderColor[i % 5],
              });
            });
          } else {
            if (this.locationData.some((t) => t.id === this.locationId)) {
              this.barChartDataDay.push({
                data: [],
                label: this.locationData.find((t) => t.id === this.locationId)
                  .name,
                backgroundColor: this.backgroundColor[0],
                borderColor: this.borderColor[0],
                hoverBackgroundColor: this.hoverBackgroundColor[0],
                hoverBorderColor: this.hoverBorderColor[0],
              });
            }
          }
          while (fromDate <= toDate) {
            this.barChartLabelsDay.push(
              this.datepipe.transform(fromDate, "d MMM").toUpperCase()
            );

            var chartDataDay: WaittimeChart = result.find(
              (t) => t.date === this.datepipe.transform(fromDate, "yyyy-MM-dd")
            );
            if (CommonUtility.isNotEmpty(chartDataDay)) {
              this.locationData.forEach((location: Location) => {
                if (
                  CommonUtility.isNotEmpty(chartDataDay.data) &&
                  chartDataDay.data.some(
                    (t) => t.locationName === location.name
                  )
                ) {
                  let avgWaitTime: number = Number(
                    chartDataDay.data.find(
                      (t) => t.locationName === location.name
                    ).avgWaitTime
                  );
                  this.barChartDataDay
                    .find((t) => t.label === location.name)
                    .data.push(avgWaitTime);
                } else {
                  this.barChartDataDay
                    .find((t) => t.label === location.name)
                    .data.push(0);
                }
              });
            } else {
              this.locationData.forEach((location: Location) => {
                this.barChartDataDay
                  .find((t) => t.label === location.name)
                  .data.push(0);
              });
            }

            fromDate = this.addDays(fromDate, 1);
          }
        },
        (error) => {}
      );
  }
  fillSignUp(id: number) {
    this.IsmodelShow = false;
    if (this.locationinputData) {
      this.locationinputData.forEach((customLocationInput) => {
        this.frmUser.addControl(customLocationInput.name, new FormControl(""));
        if (customLocationInput.required) {
          this.frmUser
            .get(customLocationInput.name)
            .setValidators([Validators.required]);
          this.frmUser.get(customLocationInput.name).updateValueAndValidity();
        }
        if (
          customLocationInput.type === "Selection" &&
          customLocationInput.multiple
        ) {
          customLocationInput.defaultValue =
            customLocationInput.defaultInput.split(",");
        }
      });
    }

    if (id > 0) {
      this.publicService.endUserById(id).subscribe((result) => {
        this.userInputDetails = result.userDetails;
        this.frmUser.patchValue({ ...result });
        if (this.locationinputData) {
          this.locationinputData.forEach((customLocationInput) => {
            this.userInputDetails.forEach((input) => {
              if (
                input.userId === id &&
                input.locationInputId === customLocationInput.id
              ) {
                this.frmUser
                  .get(customLocationInput.name)
                  .setValue(input.value);
              }
            });
          });
          this.getInputData(result);
        }
      });
    }
  }
  getInputData(user) {
    this.selectedUser = user;
    let userDetails = user.userDetails;
    this.locationinputData.map((loc, i) => {
      userDetails.map((user) => {
        if (user.locationInputId == loc.id) {
          this.locationinputData[i].defaultInput = user.value;
        }
      });
    });
    this.frmUser.get("name").setValue(user.name);
    this.frmUser.get("email").setValue(user.email);
    this.frmUser.get("phone").setValue(user.phone);
  }
  getSpotData() {
    let latestSpotdata = [];
    if (CommonUtility.isNotEmpty(this.locationId)) {
      this.dashboardService.getSpotData(this.locationId).subscribe(
        (result) => {
          latestSpotdata = latestSpotdata.concat(
            result.filter((t) => t.status === "Serving")
          );
          latestSpotdata = latestSpotdata.concat(
            result.filter((t) => t.status === "Waiting")
          );
          latestSpotdata = latestSpotdata.concat(
            result.filter((t) => t.status === "Resolved")
          );
          latestSpotdata = latestSpotdata.concat(
            result.filter((t) => t.status === "Cancelled")
          );
          this.spotData = latestSpotdata;
        },
        (error) => {}
      );
    }
  }
  sharelink() {
    var location = this.locationData.find((t) => t.id === this.locationId);
    this.storeUniqueId = location.qrCodeURL.toString();

    this.value = `${environment.webUrl}/selectmode/${this.storeUniqueId}`;
  }
  copyMessage() {
    let val: string;

    val = `${environment.webUrl}/selectmode/${this.storeUniqueId}`;
    // val = `${environment.webUrl}/selectmode/${this.encrDecrService.set(
    //   environment.encryptKey,
    //   this.storeUniqueId
    // )}`;

    const selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = val;

    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
  }
  print(): void {
    var canvas = document.getElementById("canvas")
      .childNodes[0] as HTMLCanvasElement;
    var image = document.createElement("img");
    image.setAttribute("src", canvas.toDataURL());

    let printContents, popupWin;

    printContents = image.outerHTML.toString();
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>
            img{padding:100px;text-align:center;width:300px;height:300px}
          </style>
        </head>
        <body onload="window.print();window.close()">${printContents}</body>
      </html>`);
    popupWin.document.close();
  }
  storeActivate() {
    this.isActivate = !this.isActivate;
    this.accountService.activateStore(this.locationId).subscribe((result) => {
      this.activateButtonText = !this.isActivate ? "ACTIVATE" : "DEACTIVATE";
      this.activateText = !this.isActivate
        ? "Please Activate the Store"
        : "Please Deactivate the Store";
    });
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
  cancel(id: number) {
    this.dashboardService.cancel(id).subscribe(
      (result) => {
        this.notificationService.success("Successfully Cancelled.");
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
  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  reserveSpot() {
    const initialState = {
      locationId: this.locationId,
    };

    this.bsModalRef = this.modalService.show(ReserveSpotComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });

    this.bsModalRef.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }
  bookSlot() {
    const initialState = {
      locationId: this.locationId,
    };

    this.bsModalRef = this.modalService.show(BbBookingComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });

    this.bsModalRef.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }
  viewDetails(bookingId) {
    const initialState = {
      bookingId,
    };

    this.bsModalRef = this.modalService.show(BookingInfoComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });

    this.bsModalRef.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }
  viewMap(event, activity) {
    if (event.type === "click") {
      event.target.closest("datatable-body-cell").blur();
    }

    const initialState = {
      locationLongitude: Number(this.locationLongitude),
      locationLatitude: Number(this.locationLatitude),
      activityData: activity,
    };

    this.bsModalRef = this.modalService.show(ActivityMapComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });

    this.bsModalRef.content.onClose.subscribe((result: any) => {});
  }
  pageChanged(event) {
    this.page = event;
  }
  close() {
    document.getElementById("exampleModalCenter").click();
    this.createForm();
  }
}
