import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { PublicService } from "../public.service";
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from "@angular/forms";
import { ValidationService } from "@app-shared";
import {
  EndUser,
  BookingUser,
  Location,
  LocationInput,
  UserInput,
  Booking,
} from "@app-models";
import { CommonUtility, APIConstant } from "@app-core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import {
  GoogleLoginProvider,
  SocialAuthService,
  FacebookLoginProvider,
} from "angularx-social-login";
import { ApiService } from "../services/api/api.service";
import { MessagingService } from "../../service/messaging.service";
import { HelperService } from "../services/helper/helper.service";
import { EncrDecrServiceService } from "src/app/service/encr-decr-service.service";
import { environment } from "src/environments/environment";

@Component({
  templateUrl: "./reserve-spot.component.html",
  styleUrls: ["./reserve-spot.component.scss"],
})
export class ReserveSpotComponent implements OnInit {
  frmSignup: FormGroup;
  isSignUpFormSubmitted: boolean;
  privacyPolicyCheck: boolean = false;

  frmReserve: FormGroup;
  isReserveFormSubmitted: boolean;
  email: boolean = false;
  zoom = 18;
  error: any;
  center: google.maps.LatLngLiteral;
  location: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    mapTypeId: "roadmap",
  };
  markers = [];
  lat: number = 0;
  lng: number = 0;
  private locationUnqId: string;
  locationId: number;
  private routerSub: Subscription;
  storeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  user: any;
  loggedIn: boolean;
  companyLogo: string = null;
  isLoaded: boolean = false;

  basePath: string = APIConstant.basePath + "api/";
  locationData: Location;
  maxPartySize: number;
  partySize: number = 1;
  theme: string;
  color: string;
  branding: boolean = true;

  customeBookingInput: boolean = false;
  customeUserInput: boolean = false;
  customBookingLocationInputs: LocationInput[];
  customUserLocationInputs: LocationInput[];
  endUserSignUp: boolean = false;
  frmReserveInput = [];
  frmSignUpInput = [];
  userId: number;
  userInputDetails: UserInput[];
  message;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private router: Router,
    private authService: SocialAuthService,
    private notificationService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
    // private encrDecrService: EncrDecrServiceService,
    private readonly apiservice: ApiService,
    private helper: HelperService,
    private messagingService: MessagingService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.messagingService.requestPermission();
    this.messagingService.receiveMessage();
    this.message = this.messagingService.currentMessage;

    this.routerSub = this.activatedRoute.params.subscribe(
      ({ locationId, partySize, userId }) => {
        // console.log(
        //   "Decrypted",
        //   this.encrDecrService.get(environment.encryptKey, locationId)
        // );
        // locationId = this.encrDecrService.get(
        //   environment.encryptKey,
        //   locationId
        // );
        if (CommonUtility.isNotEmpty(locationId)) {
          this.locationUnqId = locationId;
          this.GetLocationData();
        }
      }
    );

    this.authService.authState.subscribe((user) => {
      this.user = user;
      if (this.user != null) {
        if (!this.checkUser(this.user)) {
          this.frmSignup.get("email").setValue(this.user.email);
          this.frmSignup.get("phone").setValue(this.user.phone);
          this.frmSignup.get("name").setValue(this.user.name);
          this.signup();
        }
        this.createBooking();
        this.authService.signOut();
      }
    });
  }

  checkUser(user) {
    return this.publicService.endUserSignUp(user).subscribe((result) => {
      if (result === null) {
        return false;
      }
      return true;
    });
  }

  private createForm() {
    this.frmReserve = this.fb.group({
      email: [
        null,
        [ValidationService.emailValidator, Validators.maxLength(50)],
      ],
      phone: ["", [Validators.required, Validators.maxLength(20)]],
      name: [""],
      userLatitude: [""],
      userLongitude: [""],
      partySize: [null],
      locationId: ["", [Validators.required]],
      userId: [""],
      bookingInput: [[]],
    });

    this.frmSignup = this.fb.group({
      name: ["", [Validators.maxLength(50)]],
      email: ["", [ValidationService.emailValidator, Validators.maxLength(50)]],
      phone: ["", [Validators.maxLength(20)]],
      userInput: [[]],
    });
  }

  createBooking() {
    this.loggedIn = this.user != null;
    if (CommonUtility.isNotNull(this.user)) {
      this.frmReserve.get("phone").clearValidators();
      this.frmReserve.get("phone").updateValueAndValidity();
      this.frmReserve.get("name").setValue(this.user.name);
      this.frmReserve.get("email").setValue(this.user.email);
      this.frmReserve.get("locationId").setValue(this.locationId);
      this.user = null;
      this.save();
    }
  }

  signGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  private GetLocationData() {
    this.publicService
      .locationDataByQr(this.locationUnqId)
      .subscribe((result) => {
        this.locationId = result.id;
        this.locationData = result;

        this.maxPartySize = this.locationData.partySize;
        this.theme = this.locationData.theme;
        this.theme = this.locationData.theme;
        this.branding = this.locationData.branding;

        if (this.locationData.isPartySizeRequired) {
          this.frmReserve.get("partySize").setValidators([Validators.required]);
          this.frmReserve.get("partySize").updateValueAndValidity();
        }
        this.frmReserve.get("partySize").setValue(this.partySize);
        this.frmReserve.get("locationId").setValue(this.locationId);

        if (result.businessAdmin.privacyPolicy === null) {
          this.privacyPolicyCheck = true;
        } else {
          this.isLoaded = true;
        }

        if (result.image !== null) {
          this.companyLogo =
            this.basePath + "location/files/image/" + result.image;
        } else {
          this.companyLogo = null;
        }

        if (
          this.locationData.locationInput.some(
            (locationInput) => locationInput.availableFor === "Booking"
          )
        ) {
          this.customeBookingInput = true;
          this.customBookingLocationInputs =
            this.locationData.locationInput.filter(
              (locationInput) =>
                locationInput.availableFor === "Booking" &&
                locationInput.isDeleted === false &&
                locationInput.enabled == true
            );

          this.customBookingLocationInputs.forEach((customLocationInput) => {
            this.frmReserve.addControl(
              customLocationInput.name,
              new FormControl("")
            );
            if (customLocationInput.required) {
              this.frmReserve
                .get(customLocationInput.name)
                .setValidators([Validators.required]);
              this.frmReserve
                .get(customLocationInput.name)
                .updateValueAndValidity();
            }
            if (
              customLocationInput.type === "Selection" &&
              customLocationInput.multiple &&
              customLocationInput.defaultInput
            ) {
              customLocationInput.defaultValue =
                customLocationInput.defaultInput.split(",");
            }
          });
        }

        this.lat = Number(result.latitude);
        this.lng = Number(result.longitude);
        this.ref.detectChanges();
        this.storeName = result.businessAdmin.companyName;

        this.address = result.address;
        this.city = result.city;
        this.state = result.state;
        this.zipCode = result.zipCode;
        this.country = result.country;

        navigator.geolocation.getCurrentPosition((x) => {
          this.center = {
            lat: x.coords.latitude,
            lng: x.coords.longitude,
          };
          this.frmReserve.get("userLatitude").setValue(x.coords.latitude);
          this.frmReserve.get("userLongitude").setValue(x.coords.longitude);

          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer();
          var geocoder = new google.maps.Geocoder();

          const map = new google.maps.Map(
            document.getElementById("map") as HTMLElement,
            {
              zoom: 6,
              center: new google.maps.LatLng(this.center.lat, this.center.lng),
            }
          );
          const request = {
            origin: new google.maps.LatLng(this.center.lat, this.center.lng),
            destination: new google.maps.LatLng(this.lat, this.lng),
            travelMode: google.maps.TravelMode.DRIVING,
          };
          directionsService.route(request, (response, status) => {
            if (status === "OK") {
              directionsRenderer.setMap(map);
              directionsRenderer.setDirections(response);
            } else {
              window.alert("Directions request failed due to " + status);
            }
          });
        });
      });
  }

  emailClick() {
    this.email = !this.email;
    this.frmReserve.get("email").clearValidators();
    this.frmReserve.get("phone").clearValidators();
    if (this.email) {
      this.frmReserve.get("email").setValidators([Validators.required]);
    } else {
      this.frmReserve.get("phone").setValidators([Validators.required]);
    }
    this.frmReserve.get("email").updateValueAndValidity();
    this.frmReserve.get("phone").updateValueAndValidity();
  }

  getNumberReserve(obj) {
    if (this.frmReserve.valid) {
      this.frmReserve.get("phone").setValue(obj);
    }
  }
  hasErrorReserve(obj) {
    if (!obj && this.frmReserve.value.phone !== "") {
      this.frmReserve.get("phone").setErrors(["invalid_cell_phone", true]);
    }
  }

  getNumberSignUp(obj) {
    if (this.frmSignup.valid) {
      this.frmSignup.get("phone").setValue(obj);
    }
  }
  hasErrorSignUp(obj) {
    if (!obj && this.frmSignup.value.phone !== "") {
      this.frmSignup.get("phone").setErrors(["invalid_cell_phone", true]);
    }
  }

  save() {
    this.isReserveFormSubmitted = true;
    this.frmReserveInput = [];
    if (!this.frmReserve.valid) {
      return;
    }

    if (this.customBookingLocationInputs) {
      this.customBookingLocationInputs.forEach((customLocationInput) => {
        this.frmReserveInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmReserve.get(customLocationInput.name).value.toString(),
        });
      });
    }
    this.frmReserve.get("bookingInput").setValue(this.frmReserveInput);
    this.error = null;

    let endUserData: BookingUser = this.frmReserve.value;
    endUserData.deviceToken = localStorage.getItem("deviceToken");

    this.publicService.endUserSignUp(endUserData).subscribe((result) => {
      if (result == null) {
        this.endUserSignUp = true;
        this.fillSignUp(0);
      } else if (
        ((result.name === null || "") && this.locationData.isNameRequired) ||
        ((result.email === null || "") && this.locationData.isEmailRequired) ||
        ((result.phone === null || "") && this.locationData.isPhoneRequired)
      ) {
        this.endUserSignUp = true;
        this.fillSignUp(result.id);
      } else {
        endUserData.userId = result.id;
        let savedUser = result;
        const uniqueid = result.uniqueid;

        this.publicService.booking(endUserData).subscribe(
          (result) => {
            if (result.error != undefined) {
              this.notificationService.error(result.error);
            } else {
              localStorage.setItem("uid", result.booking.userId);
              localStorage.setItem("locationId", result.booking.locationId);
              this.notificationService.success(
                "You have reserved spot successfully!!"
              );
              this.helper.reserveSpot(true);

              if (savedUser.email !== null && savedUser.phone !== null) {
                this.apiservice.createUser(result.booking.userId, {
                  name: savedUser.name,
                  email: savedUser.email,
                  phone: savedUser.phone,
                  locationId: result.booking.locationId,
                  uniqueid: uniqueid,
                });
              } else if (savedUser.email !== null) {
                this.apiservice.createUser(result.booking.userId, {
                  name: savedUser.name,
                  email: savedUser.email,
                  locationId: result.booking.locationId,
                  uniqueid: uniqueid,
                });
              } else if (savedUser.phone !== null) {
                this.apiservice.createUser(result.booking.userId, {
                  name: savedUser.name,
                  phone: savedUser.phone,
                  locationId: result.booking.locationId,
                  uniqueid: uniqueid,
                });
              }
              this.router.navigateByUrl(
                `waitlist/${result.booking.id}/${this.locationUnqId}`
              );
            }
          },
          (error) => {
            if ((error && error.status === 400) || error.status === 404) {
              this.notificationService.warning("Store time has been closed !!");
              this.error = error.error ? error.error || null : null;
            } else if (error && error.status === 500) {
              this.error = {
                error: ["Something went wrong. Please try again later."],
              };
            } else {
              this.error = {
                error: ["Please check your internet connection."],
              };
            }
          }
        );
      }
    });
  }

  fillSignUp(id: number) {
    if (this.locationData.isNameRequired) {
      this.frmSignup.get("name").setValidators([Validators.required]);
      this.frmSignup.get("name").updateValueAndValidity();
    }

    if (this.locationData.isEmailRequired) {
      this.frmSignup.get("email").setValidators([Validators.required]);
      this.frmSignup.get("email").updateValueAndValidity();
    }

    if (this.locationData.isPhoneRequired) {
      this.frmSignup.get("phone").setValidators([Validators.required]);
      this.frmSignup.get("phone").updateValueAndValidity();
    }

    if (
      this.locationData.locationInput.some(
        (locationInput) => locationInput.availableFor === "User"
      )
    ) {
      this.customeUserInput = true;
      this.customUserLocationInputs = this.locationData.locationInput.filter(
        (locationInput) =>
          locationInput.availableFor === "User" &&
          locationInput.isDeleted === false &&
          locationInput.enabled === true
      );
      if (this.customUserLocationInputs) {
        this.customUserLocationInputs.forEach((customLocationInput) => {
          this.frmSignup.addControl(
            customLocationInput.name,
            new FormControl("")
          );
          if (customLocationInput.required) {
            this.frmSignup
              .get(customLocationInput.name)
              .setValidators([Validators.required]);
            this.frmSignup
              .get(customLocationInput.name)
              .updateValueAndValidity();
          }
          if (
            customLocationInput.type === "Selection" &&
            customLocationInput.multiple &&
            customLocationInput.defaultInput
          ) {
            customLocationInput.defaultValue =
              customLocationInput.defaultInput.split(",");
          }
        });
      }
    }

    if (id > 0) {
      this.publicService.endUserById(id).subscribe((result) => {
        this.userInputDetails = result.userInput;

        this.frmSignup.patchValue({ ...result });
        if (this.customUserLocationInputs) {
          this.customUserLocationInputs.forEach((customLocationInput) => {
            this.userInputDetails.forEach((input) => {
              if (
                input.userId === id &&
                input.locationInputId === this.locationId
              ) {
                this.frmSignup
                  .get(customLocationInput.name)
                  .setValue(input.value);
              }
            });
          });
        }
      });
    } else {
      this.frmSignup.get("email").setValue(this.frmReserve.get("email").value);
      this.frmSignup.get("phone").setValue(this.frmReserve.get("phone").value);
      this.frmSignup.get("name").setValue(this.frmReserve.get("name").value);
    }
  }

  signup() {
    this.isSignUpFormSubmitted = true;
    this.frmSignUpInput = [];
    if (!this.frmSignup.valid) {
      return;
    }

    this.error = null;
    if (this.customUserLocationInputs) {
      this.customUserLocationInputs.forEach((customLocationInput) => {
        this.frmSignUpInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmSignup.get(customLocationInput.name).value.toString(),
        });
      });
    }
    this.frmSignup.get("userInput").setValue(this.frmSignUpInput);

    const userData: EndUser = this.frmSignup.value;
    userData.deviceToken = localStorage.getItem("deviceToken");
    if (this.userId) {
      this.publicService.endUserUpdate(this.userId, userData).subscribe(
        (result) => {
          this.notificationService.success("Details updated successfully!!");
          this.endUserSignUp = false;
          this.frmReserve.get("phone").setValue(result.phone);
          this.frmReserve.get("email").setValue(result.email);
          this.frmReserve.get("name").setValue(result.name);
          this.frmReserve.get("userId").setValue(result.id);
          this.save();
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
    } else {
      this.publicService.endUserSignIn(userData).subscribe(
        (result) => {
          this.notificationService.success(
            "Signup has been done successfully!!"
          );
          this.endUserSignUp = false;
          this.frmReserve.get("phone").setValue(result.phone);
          this.frmReserve.get("email").setValue(result.email);
          this.frmReserve.get("name").setValue(result.name);
          this.frmReserve.get("userId").setValue(result.id);
          this.save();
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
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();

    if (this.user != null) {
      this.authService.signOut();
    }

    this.user = null;
    this.loggedIn = false;
  }

  increment() {
    this.partySize++;
    this.frmReserve.get("partySize").setValue(this.partySize);
  }

  decrement() {
    this.partySize--;
    this.frmReserve.get("partySize").setValue(this.partySize);
  }
}
