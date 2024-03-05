import { AfterViewInit, Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { Calendar, List, Location, User } from "@app-models";
import {
  UserAuthService,
  CommonUtility,
  NotificationService,
  APIConstant,
} from "@app-core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AccountService } from "../account.service";

import { environment } from "src/environments/environment";
import { ValidationService } from "@app-shared";
import { ProfileService } from "../../profile/profile.service";
import QRCodeStyling from "qr-code-styling";
import { OpeningInfoComponent } from "../opening_info/opening_info.component";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { TranslateService } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";
import { HttpClient } from "@angular/common/http";

@Component({
  templateUrl: "./add-edit.component.html",
  styleUrls: ["./add-edit.component.scss"],
})
export class AccountAddEditComponent implements OnInit, AfterViewInit {
  frmAccount: FormGroup;
  isFormSubmitted: boolean;
  isActivate: boolean = false;
  activateButtonText: string = "ACTIVATE";
  isEditMode: boolean = false;
  locationData: Location;
  locationId: number;
  page: number = 1;

  public value: string;
  private routerSub: Subscription;
  error: any;
  allLocationData: Location[];
  loading: boolean;
  storeUniqueId: string;
  companyName: string;
  basePath: string = APIConstant.basePath + "api/";

  user: User;
  companyId: number;
  companyData: List[];
  qrCode;
  offsetTmz = [];
  isSuperAdmin: boolean = false;
  isBusinessOwner: boolean = false;
  openingData = [];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private userAuthService: UserAuthService,
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private modalService: BsModalService,
    public translate: TranslateService,
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    translate.addLangs(["English", "French", "Spanish", "Italy"]);
    if (localStorage.getItem("locale")) {
      const browserLang = localStorage.getItem("locale");
      translate.use(
        browserLang.match(/English|French|Spanish|Italy/)
          ? browserLang
          : "English"
      );
    } else {
      localStorage.setItem("locale", "English");
      translate.setDefaultLang("English");
    }
  }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.createForm();
    this.getTimeZone();

    this.user = this.userAuthService.getUser();
    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
    this.getAllLocationData();
    this.getCompanies();
    this.getRouteData();
  }

  getTimeZone() {
    var moment = require("moment-timezone");
    var timeZones = moment.tz.names();
    for (var i in timeZones) {
      if (!timeZones[i].includes("Etc/")) {
        this.offsetTmz.push(timeZones[i]);
      }
    }
  }
  changeLang(language: string) {
    localStorage.setItem("locale", language);
    this.translate.use(language);
  }
  timeZoneChange(event) {
    this.frmAccount.get("timeZone").setValue(event.target.value);
  }

  ngAfterViewInit() {
    this.getQRCode("", "unset");
  }

  private getRouteData() {
    this.routerSub = this.activatedRoute.params.subscribe(async ({ id }) => {
      this.fillOpenHours();

      if (CommonUtility.isNotEmpty(id) && id !== "new") {
        this.isEditMode = true;
        if (this.isSuperAdmin) {
          this.frmAccount.get("businessAdminId").disable();
        }
        this.locationId = +id;
        this.getProfileData();
      } else {
        this.isEditMode = false;
        this.frmAccount.get("businessAdminId").enable();
        const locationUnqId = Math.floor(
          100000 + Math.random() * 9000000000000000
        );
        this.storeUniqueId = locationUnqId.toString();
        this.value = `${environment.webUrl}/reservespot/${this.storeUniqueId}`;
      }
    });
  }

  async fillOpenHours() {
    this.openingData = [];
    await this.accountService.getWeekDays().subscribe((result) => {
      result.forEach((weekDay) => {
        this.openingData.push({
          weekDay: weekDay,
          status: "All Day",
          time: [
            {
              openTime: "00:00",
              closeTime: "23:59",
            },
          ],
        });
      });
    });
  }

  async getProfileData() {
    await this.accountService.getById(this.locationId).subscribe(
      (data) => {
        this.locationData = data;
        this.locationData.calendar.forEach((element) => {
          var index = this.openingData.findIndex(
            (info) => info.weekDay === element.weekDay
          );
          this.openingData[index] = element;
        });

        this.isActivate = this.locationData.isActive;
        this.activateButtonText = this.locationData.isActive
          ? "DEACTIVATE"
          : "ACTIVATE";
        this.storeUniqueId = this.locationData.qrCodeURL.toString();
        this.value = `${environment.webUrl}/reservespot/${this.storeUniqueId}`;
        if (this.locationData.image) {
          this.getQRCode(
            this.basePath + "location/files/image/" + this.locationData.image,
            this.locationData.theme
          );
        } else {
          this.getQRCode("", "unset");
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
    this.frmAccount = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.maxLength(50),
          ValidationService.locationUnique,
          ValidationService.validName,
        ],
      ],
      contact: [
        "",
        [
          Validators.required,
          Validators.maxLength(15),
          ValidationService.allowOnlyNumber,
        ],
      ],
      zipCode: [""],
      longitude: ["", [Validators.required, ValidationService.allowOnlyNumber]],
      latitude: ["", [Validators.required, ValidationService.allowOnlyNumber]],
      address: [""],
      city: ["", [ValidationService.allowOnlyString]],
      state: ["", [ValidationService.allowOnlyString]],
      country: ["", [ValidationService.allowOnlyString]],
      timeZone: ["", [Validators.required]],
      businessAdminId: ["", [Validators.required]],
      qrCodeURL: [""],
      waitTime: ["5", [Validators.required]],
      partySize: ["1", [Validators.required]],
      language: [""],
      isActive: [true],
      calendar: [null],
    });
  }

  getZipData(zipcode: any) {
    if (!zipcode) {
      return;
    }

    if (this.isEditMode && this.locationData.zipCode === zipcode) {
      this.frmAccount.controls.city.setValue(this.locationData.city);
      this.frmAccount.controls.state.setValue(this.locationData.state);
      this.frmAccount.controls.country.setValue(this.locationData.country);
      this.frmAccount.controls.latitude.setValue(this.locationData.latitude);
      this.frmAccount.controls.longitude.setValue(this.locationData.longitude);
    } else {
      this.reset(zipcode);
    }
  }

  private setFormData() {
    this.frmAccount.patchValue({ ...this.locationData });
  }

  storeActivate() {
    if (this.isEditMode) {
      this.isActivate = !this.isActivate;
      this.frmAccount.controls.isActive.setValue(this.isActivate);
      this.frmAccount.controls.qrCodeURL.setValue(this.storeUniqueId);
      const locationData: Location = this.frmAccount.value;
      this.accountService.activateStore(this.locationId).subscribe((result) => {
        this.activateButtonText = !locationData.isActive
          ? "ACTIVATE"
          : "DEACTIVATE";
      });
    }
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

  save() {
    this.error = null;

    this.validateAllFormFields(this.frmAccount);

    if (this.isSuperAdmin && !this.isEditMode) {
      this.frmAccount.controls.businessAdminId.setValue(this.companyId);
    } else if (!this.isSuperAdmin && !this.isEditMode) {
      this.frmAccount.controls.businessAdminId.setValue(this.user.id);
    }
    this.frmAccount.controls.isActive.setValue(this.isActivate);
    this.frmAccount.controls.qrCodeURL.setValue(this.storeUniqueId);
    const locationData: Location = this.frmAccount.value;
    if (!this.frmAccount.valid) {
      return;
    } else if (!this.frmAccount.value.calendar) {
      this.notificationService.warning("Please add opening hours details");
    } else {
      if (this.isEditMode) {
        this.updateLocation(locationData, false);
      } else {
        this.createLocation(locationData);
      }
    }
  }

  createLocation(location: Location) {
    this.accountService.add(location).subscribe(
      (result) => {
        this.notificationService.success(
          "Store details has been created successfully."
        );
        this.addLocation();
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;
        } else if (error && error.status === 500) {
          if (error.error.message.indexOf("ER_DUP_ENTRY") >= -1) {
            this.notificationService.warning("Store is already exist!!");
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

  async updateLocation(location: Location, storeActivation: boolean) {
    await this.accountService.update(this.locationId, location).subscribe(
      (result) => {
        this.notificationService.success(
          "Store details has been updated successfully."
        );
        if (!storeActivation) {
          this.edit(this.locationId);
        }
      },
      (error) => {
        if (error && error.status === 400) {
          this.error = error.error ? error.error.modelState || null : null;
        } else if (error && error.status === 500) {
          if (error.error.message.indexOf("ER_DUP_ENTRY") >= -1) {
            this.notificationService.warning("Store is already exist!!");
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

  getAllLocationData() {
    this.accountService.get().subscribe((result: Location[]) => {
      this.allLocationData = result || [];
      this.loading = false;
    });
  }

  edit(id: number) {
    this.router.navigateByUrl(`secure/account/store/${id}`);
    this.createForm();
    this.ngOnInit();
  }

  print() {
    var canvas = document.getElementById("canvas")
      .childNodes[0] as HTMLCanvasElement;
    var image = document.createElement("img");
    image.setAttribute("src", canvas.toDataURL());
    var iframe: any = document.getElementById("iframe");
    iframe.contentWindow.document.body.innerHTML = "";
    iframe.contentWindow.document.write(
      "<html><head><style>img{padding:100px;text-align:center;width:300px;height:300px}</style></head><body>" +
        image.outerHTML.toString() +
        "<script>window.print();</script></body></html>"
    );
  }

  getCompanies() {
    this.companyData = [];

    if (this.isSuperAdmin) {
      this.profileService.getProfiles().subscribe((result: User[]) => {
        if (CommonUtility.isNotEmpty(result)) {
          result.forEach((user: User) => {
            if (CommonUtility.isNotEmpty(user?.companyName)) {
              this.companyData.push({
                id: user.id,
                name: user?.companyName,
                logo: user.logo,
              });
            }
          });
          this.companyId = this.companyData[0].id;
        }
      });
    }
  }

  getQRCode(image: string, theme: string) {
    this.qrCode = new QRCodeStyling({
      width: 225,
      height: 225,
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

  addLocation() {
    this.router.navigateByUrl(`secure/account/store/new`);

    this.ngOnInit();
  }

  extractAddress(address) {
    var city = "";
    var state = "";
    var country = "";

    if (address.results.length) {
      var arrComponents = address.results[0].address_components;
      arrComponents.forEach((component) => {
        var type = component.types[0];
        if (
          city == "" &&
          (type == "sublocality_level_1" ||
            type == "locality" ||
            type == "administrative_area_level_2")
        ) {
          city = component.long_name.trim();
        }

        if (state == "" && type == "administrative_area_level_1") {
          state = component.long_name.trim();
        }

        if (country == "" && type == "country") {
          country = component.long_name.trim();
        }

        if (city != "" && state != "" && country != "") {
          return;
        }
      });
    }
    return {
      city: city,
      state: state,
      country: country,
      location: address.results[0].geometry.location,
    };
  }

  reset(zipcode) {
    if (zipcode) {
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&sensor=true&key=AIzaSyCUkCisNim29ukTbamtTpgcMNGonJziWQA`
      )
        .then((response) => {
          if (response.status !== 200) {
            return;
          } else {
            response.json().then((data) => {
              const result = this.extractAddress(data);

              this.frmAccount.controls.city.setValue(result.city);
              this.frmAccount.controls.state.setValue(result.state);
              this.frmAccount.controls.country.setValue(result.country);
              this.frmAccount.controls.latitude.setValue(result.location.lat);
              this.frmAccount.controls.longitude.setValue(result.location.lng);
            });
          }
        })
        .catch((e) => {});
    } else {
      this.frmAccount.controls.zipCode.setValue("");
      this.frmAccount.controls.city.setValue("");
      this.frmAccount.controls.state.setValue("");
      this.frmAccount.controls.country.setValue("");
      this.frmAccount.controls.latitude.setValue("");
      this.frmAccount.controls.longitude.setValue("");
    }
  }

  async openingInfo(locationId: number, status: string) {
    await this.fillOpenHours();
    let bsModalRef: BsModalRef;
    const initialState = {
      locationId,
      status,
      openingInfo: this.openingData,
    };

    bsModalRef = this.modalService.show(OpeningInfoComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    bsModalRef.content.onClose.subscribe((result: Calendar[]) => {
      if (result) {
        this.openingData = result;
        this.frmAccount.get("calendar").setValue(result);
      } else {
        if (this.locationId && this.isEditMode) {
          this.locationData.calendar.forEach((element) => {
            var index = this.openingData.findIndex(
              (info) => info.weekDay === element.weekDay
            );
            this.openingData[index] = element;
          });
          this.ngOnInit();
        } else {
          this.fillOpenHours();
        }
      }
    });
  }
  deletestore(id: number) {
    this.accountService.deleteLocation(id).subscribe(
      (result) => {
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

  pageChanged(event) {
    this.page = event;
  }
}
