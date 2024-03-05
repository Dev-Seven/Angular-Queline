import { ChangeDetectorRef, Component, OnInit, Renderer2 } from "@angular/core";
import {
  BbBookingUser,
  BbCalendar,
  BookingUser,
  Location,
  LocationInput,
} from "@app-models";
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
  selector: "bb-booking",
  templateUrl: "./bb-booking.component.html",
  styleUrls: ["./bb-booking.component.scss"],
})
export class BbBookingComponent implements OnInit {
  public onClose: Subject<{}>;
  frmBookSlot: FormGroup;
  isFormSubmitted: boolean;
  error: any;
  minDate: Date;
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
  endUserData: BbBookingUser;

  slotData: Array<any> = [];
  calendar: BbCalendar[];
  selectedDay: string;
  selectedDate: Date;
  availableSlots: Array<any> = [];
  selectedSlot: any;
  allowBooking: boolean = true;

  constructor(
    private renderer: Renderer2,
    public bsModalRef: BsModalRef,
    private publicService: PublicService,
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private notificationService: ToastrService
  ) {
    this.minDate = new Date();
    this.createForm();
  }

  ngOnInit(): void {
    this.onClose = new Subject();
    this.GetLocationData();
  }

  private createForm() {
    this.frmBookSlot = this.fb.group({
      email: [
        null,
        [ValidationService.emailValidator, Validators.maxLength(50)],
      ],
      date: ["", [Validators.required]],
      slot: ["", [Validators.required]],

      name: ["", [Validators.maxLength(50)]],
      userLatitude: [""],
      userLongitude: [""],

      locationId: ["", [Validators.required]],
      userId: [""],
      bookingInput: [[]],
      userInput: [[]],
    });
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
    // code for fetching lat,long from location
    this.publicService.locationData(this.locationId).subscribe((result) => {
      this.locationData = result;

      this.GetCalendarData();

      this.frmBookSlot.get("locationId").setValue(this.locationId);

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
          this.frmBookSlot.addControl(
            customLocationInput.name,
            new FormControl("")
          );
          if (customLocationInput.required) {
            this.frmBookSlot
              .get(customLocationInput.name)
              .setValidators([Validators.required]);
            this.frmBookSlot
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
        this.frmBookSlot.get("name").setValidators([Validators.required]);
        this.frmBookSlot.get("name").updateValueAndValidity();
      }

      if (this.locationData.isEmailRequired) {
        this.frmBookSlot.get("email").setValidators([Validators.required]);
        this.frmBookSlot.get("email").updateValueAndValidity();
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
            this.frmBookSlot.addControl(
              customLocationInput.name,
              new FormControl("")
            );
            if (customLocationInput.required) {
              this.frmBookSlot
                .get(customLocationInput.name)
                .setValidators([Validators.required]);
              this.frmBookSlot
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
        this.frmBookSlot.get("userLatitude").setValue(x.coords.latitude);
        this.frmBookSlot.get("userLongitude").setValue(x.coords.longitude);
      });
    });
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
    this.isFormSubmitted = true;

    if (!this.frmBookSlot.valid) {
      return;
    }
    if (this.customBookingLocationInputs) {
      this.customBookingLocationInputs.forEach((customLocationInput) => {
        this.frmReserveInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmBookSlot.get(customLocationInput.name).value,
        });
      });
    }
    if (this.customUserLocationInputs) {
      this.customUserLocationInputs.forEach((customLocationInput) => {
        this.frmSignUpInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmBookSlot.get(customLocationInput.name).value,
        });
      });
    }
    this.frmBookSlot.get("bookingInput").setValue(this.frmReserveInput);
    this.frmBookSlot.get("userInput").setValue(this.frmSignUpInput);

    this.error = null;

    this.endUserData = this.frmBookSlot.value;

    this.publicService.endUserSignUp(this.endUserData).subscribe((result) => {
      if (result == null) {
        this.userId = 0;
        this.signup();
      } else if (
        ((result.name === null || "") && this.locationData.isNameRequired) ||
        ((result.email === null || "") && this.locationData.isEmailRequired)
      ) {
        this.userId = result.id;
        this.signup();
      } else {
        this.endUserData.userId = result.id;

        this.endUserData.slotId = this.selectedSlot.id;
        this.endUserData.bookingDate = this.selectedDate.toDateString();
        let savedUser = result;
        const uniqueid = result.uniqueid;

        this.publicService.bbBooking(this.endUserData).subscribe(
          (result) => {
            if (this.selectedSlot.bookingId == null) {
              this.selectedSlot.bookingId = result.booking.id.toString();
            } else {
              let bookings = this.selectedSlot.bookingId.split(",");
              bookings.push(`${result.booking.id}`);
              this.selectedSlot.bookingId = bookings.toString();
            }

            this.publicService
              .slotBooking(this.selectedSlot.id, this.selectedSlot)
              .subscribe((result) => {});

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

    if (!this.frmBookSlot.valid) {
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
