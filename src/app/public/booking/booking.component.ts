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
  BbBookingUser,
  Location,
  LocationInput,
  UserInput,
  Booking,
  BbCalendar,
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
  selector: "app-booking",
  templateUrl: "./booking.component.html",
  styleUrls: ["./booking.component.css"],
})
export class BookingComponent implements OnInit {
  frmSignup: FormGroup;
  isSignUpFormSubmitted: boolean;
  privacyPolicyCheck: boolean = false;

  frmBooking: FormGroup;
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

  theme: string;
  color: string;
  branding: boolean = true;

  customeBookingInput: boolean = false;
  customeUserInput: boolean = false;
  customBookingLocationInputs: LocationInput[];
  customUserLocationInputs: LocationInput[];
  endUserSignUp: boolean = false;
  frmBookingInput = [];
  frmSignUpInput = [];
  userId: number;
  userInputDetails: UserInput[];
  message;
  minDate: Date;

  slotData: Array<any> = [];
  calendar: BbCalendar[];
  selectedDay: string;
  selectedDate: Date;
  availableSlots: Array<any> = [];
  selectedSlot: any;
  allowBooking: boolean = true;
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
    this.minDate = new Date();
    this.createForm();
  }

  ngOnInit(): void {
    this.messagingService.requestPermission();
    this.messagingService.receiveMessage();
    this.message = this.messagingService.currentMessage;

    this.routerSub = this.activatedRoute.params.subscribe(
      ({ locationId, userId }) => {
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
    this.frmBooking = this.fb.group({
      email: [
        null,
        [ValidationService.emailValidator, Validators.maxLength(50)],
      ],
      date: ["", [Validators.required]],
      slot: ["", [Validators.required]],

      name: [""],
      userLatitude: [""],
      userLongitude: [""],

      locationId: ["", [Validators.required]],
      userId: [""],
      bookingInput: [[]],
    });

    this.frmSignup = this.fb.group({
      name: ["", [Validators.maxLength(50)]],
      email: ["", [ValidationService.emailValidator, Validators.maxLength(50)]],
      userInput: [[]],
    });
  }

  createBooking() {
    this.loggedIn = this.user != null;
    if (CommonUtility.isNotNull(this.user)) {
      this.frmBooking.get("name").setValue(this.user.name);
      this.frmBooking.get("email").setValue(this.user.email);
      this.frmBooking.get("locationId").setValue(this.locationId);
      this.user = null;
      // console.log('save')
      this.save();
    }
  }

  signGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  private GetCalendarData() {
    this.publicService
      .getBbCalendarByLocationId(this.locationId)
      .subscribe((result: BbCalendar[]) => {
        if (result) {
          result.forEach((cal, c) => {
            this.slotData.push({
              weekDay: cal.weekDay,
              availableSlots: [],
            });

            this.maxPartySize = cal.maxPartySize;
            cal.bbTime.forEach((time, t) => {
              if (time.bbSlot && time.bbSlot.length > 0) {
                time.bbSlot.forEach((slot, s) => {
                  this.slotData[c].availableSlots.push({
                    id: slot.id,
                    slotDuration: slot.slotDuration,
                  });
                  this.slotData[c].availableSlots.sort(
                    (a, b) =>
                      parseInt(a.slotDuration[0]) - parseInt(b.slotDuration[0])
                  );
                });
              }
            });
          });
        }
      });
  }

  private GetLocationData() {
    this.publicService
      .locationDataByQr(this.locationUnqId)
      .subscribe((result) => {
        this.locationId = result.id;
        this.locationData = result;
        this.GetCalendarData();
        this.maxPartySize = this.locationData.partySize;
        this.theme = this.locationData.theme;
        this.theme = this.locationData.theme;
        this.branding = this.locationData.branding;

        this.frmBooking.get("locationId").setValue(this.locationId);

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
            this.frmBooking.addControl(
              customLocationInput.name,
              new FormControl("")
            );
            if (customLocationInput.required) {
              this.frmBooking
                .get(customLocationInput.name)
                .setValidators([Validators.required]);
              this.frmBooking
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
          this.frmBooking.get("userLatitude").setValue(x.coords.latitude);
          this.frmBooking.get("userLongitude").setValue(x.coords.longitude);

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
    this.frmBooking.get("email").clearValidators();

    this.frmBooking.get("email").setValidators([Validators.required]);

    this.frmBooking.get("email").updateValueAndValidity();
  }

  changeSlotData(e) {
    this.selectedSlot = "";
    this.allowBooking = true;
    this.selectedDate = new Date(e);
    this.selectedDay = this.selectedDate.toLocaleDateString("en-Us", {
      weekday: "long",
    });

    this.availableSlots = this.slotData.find(
      (slot) => slot.weekDay == this.selectedDay
    ).availableSlots;
  }

  availSlot(slot) {
    if (slot) {
      this.publicService
        .getBookedSlots(this.locationId, slot.id)
        .subscribe((bookings) => {
          if (bookings && bookings.length > 0) {
            bookings = bookings.filter(
              (book) =>
                new Date(book.bookingTime).toLocaleDateString() ===
                this.selectedDate.toLocaleDateString()
            );

            if (bookings && bookings.length >= this.maxPartySize) {
              this.allowBooking = false;
              this.notificationService.warning("Slot is not available");
            } else {
              this.allowBooking = true;
            }
          } else {
            this.allowBooking = true;
          }
        });
    }
  }

  save() {
    this.isReserveFormSubmitted = true;
    this.frmBookingInput = [];
    if (!this.frmBooking.valid) {
      return;
    }

    if (this.customBookingLocationInputs) {
      this.customBookingLocationInputs.forEach((customLocationInput) => {
        this.frmBookingInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmBooking.get(customLocationInput.name).value.toString(),
        });
      });
    }
    this.frmBooking.get("bookingInput").setValue(this.frmBookingInput);
    this.error = null;

    let endUserData: BbBookingUser = this.frmBooking.value;
    endUserData.deviceToken = localStorage.getItem("deviceToken");

    this.publicService.endUserSignUp(endUserData).subscribe((result) => {
      if (result == null) {
        this.endUserSignUp = true;

        this.fillSignUp(0);
      } else if (
        ((result.name === null || "") && this.locationData.isNameRequired) ||
        ((result.email === null || "") && this.locationData.isEmailRequired)
      ) {
        this.endUserSignUp = true;
        this.fillSignUp(result.id);
      } else {
        endUserData.userId = result.id;
        endUserData.slotId = this.selectedSlot.id;
        endUserData.slotDuration = this.selectedSlot.slotDuration;
        endUserData.bookingDate = this.selectedDate.toDateString();
        let savedUser = result;
        const uniqueid = result.uniqueid;

        this.publicService.bbBooking(endUserData).subscribe(
          (result) => {
            if (result.error != undefined) {
              this.notificationService.error(result.error);
            } else {
              if (this.selectedSlot.bookingId == null) {
                this.selectedSlot.bookingId = result.booking.id.toString();
              } else {
                let bookings = this.selectedSlot.bookingId.split(",");
                bookings.push(`${result.booking.id}`);
                this.selectedSlot.bookingId = bookings.toString();
              }

              this.publicService
                .slotBooking(this.selectedSlot.id, this.selectedSlot)
                .subscribe((res) => {
                  localStorage.setItem("uid", result.booking.userId);
                  localStorage.setItem("locationId", result.booking.locationId);
                  this.notificationService.success(
                    "You have Booked slot successfully!!"
                  );
                  this.helper.bbBookSpot(true);
                });

              if (savedUser.email !== null) {
                this.apiservice.createUser(result.booking.userId, {
                  name: savedUser.name,
                  email: savedUser.email,
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
              }
              this.router.navigateByUrl(
                `booking-waitlist/${result.booking.id}/${this.locationUnqId}`
              );
              // this.router.navigateByUrl(
              //   `booking-waitlist/${this.encrDecrService.set(
              //     environment.encryptKey,
              //     result.booking.id
              //   )}/${this.encrDecrService.set(
              //     environment.encryptKey,
              //     this.locationUnqId
              //   )}`
              // );
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
      this.frmSignup.get("email").setValue(this.frmBooking.get("email").value);

      this.frmSignup.get("name").setValue(this.frmBooking.get("name").value);
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

          this.frmBooking.get("email").setValue(result.email);
          this.frmBooking.get("name").setValue(result.name);
          this.frmBooking.get("userId").setValue(result.id);
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

          this.frmBooking.get("email").setValue(result.email);
          this.frmBooking.get("name").setValue(result.name);
          this.frmBooking.get("userId").setValue(result.id);
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
}
