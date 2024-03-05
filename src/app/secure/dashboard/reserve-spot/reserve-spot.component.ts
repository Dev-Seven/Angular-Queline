import { ChangeDetectorRef, Component, OnInit, Renderer2 } from "@angular/core";
import { BookingUser, Location, LocationInput } from "@app-models";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { PublicService } from "src/app/public/public.service";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ValidationService } from "@app-shared";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "reservespot",
  templateUrl: "./reserve-spot.component.html",
  styleUrls: ["./reserve-spot.component.scss"],
})
export class ReserveSpotComponent implements OnInit {
  public onClose: Subject<{}>;
  frmReservSpot: FormGroup;
  isFormSubmitted: boolean;
  error: any;

  locationId: number;
  locationData: Location;
  maxPartySize: number;
  partySize: number = 1;

  customeBookingInput: boolean = false;
  customeUserInput: boolean = false;
  customBookingLocationInputs: LocationInput[];
  customUserLocationInputs: LocationInput[];

  frmReserveInput = [];
  frmSignUpInput = [];
  userId: number = 0;
  endUserData: BookingUser;

  constructor(
    private renderer: Renderer2,
    public bsModalRef: BsModalRef,
    private publicService: PublicService,
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private notificationService: ToastrService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.onClose = new Subject();
    this.GetLocationData();
  }

  private createForm() {
    this.frmReservSpot = this.fb.group({
      email: [
        null,
        [ValidationService.emailValidator, Validators.maxLength(50)],
      ],
      phone: [null, [Validators.required, Validators.maxLength(20)]],
      name: ["", [Validators.maxLength(50)]],
      userLatitude: [""],
      userLongitude: [""],
      partySize: [null],
      locationId: ["", [Validators.required]],
      userId: [""],
      bookingInput: [[]],
      userInput: [[]],
    });
  }

  private GetLocationData() {
    // code for fetching lat,long from location
    this.publicService.locationData(this.locationId).subscribe((result) => {
      this.locationData = result;

      this.maxPartySize = this.locationData.partySize;
      if (this.locationData.isPartySizeRequired) {
        this.frmReservSpot
          .get("partySize")
          .setValidators([
            Validators.required,
            Validators.max(this.maxPartySize),
            Validators.min(1),
          ]);
        this.frmReservSpot.get("partySize").updateValueAndValidity();
      } else {
        this.frmReservSpot
          .get("partySize")
          .setValidators([
            Validators.max(this.maxPartySize),
            Validators.min(1),
          ]);
        this.frmReservSpot.get("partySize").updateValueAndValidity();
      }
      this.frmReservSpot.get("partySize").setValue(this.partySize);
      this.frmReservSpot.get("locationId").setValue(this.locationId);

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
              locationInput.isDeleted === false
          );

        this.customBookingLocationInputs.forEach((customLocationInput) => {
          this.frmReservSpot.addControl(
            customLocationInput.name,
            new FormControl("")
          );
          if (customLocationInput.required) {
            this.frmReservSpot
              .get(customLocationInput.name)
              .setValidators([Validators.required]);
            this.frmReservSpot
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

      if (this.locationData.isNameRequired) {
        this.frmReservSpot.get("name").setValidators([Validators.required]);
        this.frmReservSpot.get("name").updateValueAndValidity();
      }

      if (this.locationData.isEmailRequired) {
        this.frmReservSpot.get("email").setValidators([Validators.required]);
        this.frmReservSpot.get("email").updateValueAndValidity();
      }

      if (this.locationData.isPhoneRequired) {
        this.frmReservSpot.get("phone").setValidators([Validators.required]);
        this.frmReservSpot.get("phone").updateValueAndValidity();
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
            locationInput.isDeleted === false
        );
        if (this.customUserLocationInputs) {
          this.customUserLocationInputs.forEach((customLocationInput) => {
            this.frmReservSpot.addControl(
              customLocationInput.name,
              new FormControl("")
            );
            if (customLocationInput.required) {
              this.frmReservSpot
                .get(customLocationInput.name)
                .setValidators([Validators.required]);
              this.frmReservSpot
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
      }

      this.ref.detectChanges();

      navigator.geolocation.getCurrentPosition((x) => {
        this.frmReservSpot.get("userLatitude").setValue(x.coords.latitude);
        this.frmReservSpot.get("userLongitude").setValue(x.coords.longitude);
      });
    });
  }

  getNumber(obj) {
    if (this.frmReservSpot.valid) {
      this.frmReservSpot.get("phone").setValue(obj);
    }
  }
  hasError(obj) {
    if (!obj && this.frmReservSpot.value.phone !== "") {
      this.frmReservSpot.get("phone").setErrors(["invalid_cell_phone", true]);
    }
  }

  save() {
    this.isFormSubmitted = true;

    if (!this.frmReservSpot.valid) {
      return;
    }
    if (this.customBookingLocationInputs) {
      this.customBookingLocationInputs.forEach((customLocationInput) => {
        this.frmReserveInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmReservSpot.get(customLocationInput.name).value,
        });
      });
    }
    if (this.customUserLocationInputs) {
      this.customUserLocationInputs.forEach((customLocationInput) => {
        this.frmSignUpInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmReservSpot.get(customLocationInput.name).value,
        });
      });
    }
    this.frmReservSpot.get("bookingInput").setValue(this.frmReserveInput);
    this.frmReservSpot.get("userInput").setValue(this.frmSignUpInput);

    this.error = null;

    this.endUserData = this.frmReservSpot.value;

    this.publicService.endUserSignUp(this.endUserData).subscribe((result) => {
      if (result == null) {
        this.userId = 0;
        this.signup();
      } else if (
        ((result.name === null || "") && this.locationData.isNameRequired) ||
        ((result.email === null || "") && this.locationData.isEmailRequired) ||
        ((result.phone === null || "") && this.locationData.isPhoneRequired)
      ) {
        this.userId = result.id;
        this.signup();
      } else {
        this.endUserData.userId = result.id;

        this.publicService.booking(this.endUserData).subscribe(
          (result) => {
            this.notificationService.success(
              "You have reserved spot successfully!!"
            );
            this.close();
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

  signup() {
    this.isFormSubmitted = true;

    if (!this.frmReservSpot.valid) {
      return;
    }

    if (this.userId) {
      this.publicService.endUserUpdate(this.userId, this.endUserData).subscribe(
        (result) => {
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
      this.publicService.endUserSignIn(this.endUserData).subscribe(
        (result) => {
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

  close() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }
}
