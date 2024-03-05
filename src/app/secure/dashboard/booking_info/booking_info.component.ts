import { ChangeDetectorRef, Component, OnInit, Renderer2 } from "@angular/core";
import { BookingUser, Location, LocationInput, SpotData } from "@app-models";
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
import { DashboardService } from "../dashboard.service";

@Component({
  selector: "bookinginfo",
  templateUrl: "./booking_info.component.html",
  styleUrls: ["./booking_info.component.scss"],
})
export class BookingInfoComponent implements OnInit {
  public onClose: Subject<{}>;
  frmReservSpot: FormGroup;
  isFormSubmitted: boolean;
  error: any;
  bookingId: number;

  locationId: number;
  locationData: Location;
  maxPartySize: number;
  partySize: number = 1;

  customeBookingInput: boolean = false;
  customeUserInput: boolean = false;
  customBookingLocationInputs: LocationInput[];
  customUserLocationInputs: LocationInput[];
  userInputDetails;
  bookingInputDetails;
  isEditMode: boolean = false;

  frmReserveInput = [];
  frmSignUpInput = [];
  endUserData: SpotData;
  status = [];

  constructor(
    private renderer: Renderer2,
    public bsModalRef: BsModalRef,
    private dashboardService: DashboardService,
    private publicService: PublicService,
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private notificationService: ToastrService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.onClose = new Subject();
    this.publicService
      .bookingData(this.bookingId)
      .subscribe((result: SpotData) => {
        this.endUserData = result;
        this.locationId = this.endUserData.locationId;
        this.getStatus();
        this.GetLocationData();
        this.frmReservSpot
          .get("locationId")
          .setValue(this.endUserData.locationId);
        this.frmReservSpot.get("userId").setValue(this.endUserData.userId);
        this.frmReservSpot.get("name").setValue(this.endUserData.user.name);
        this.frmReservSpot.get("email").setValue(this.endUserData.user.email);
        this.frmReservSpot.get("phone").setValue(this.endUserData.user.phone);
        this.frmReservSpot
          .get("partySize")
          .setValue(this.endUserData.partySize);
        this.userInputDetails = this.endUserData.user.userDetails;
        this.bookingInputDetails = this.endUserData.bookingDetails;

        if (this.customUserLocationInputs) {
          this.customUserLocationInputs.forEach((customLocationInput) => {
            this.userInputDetails.forEach((input) => {
              if (
                input.userId === this.endUserData.userId &&
                input.locationInputId === customLocationInput.id
              ) {
                if (
                  customLocationInput.type === "Selection" &&
                  customLocationInput.multiple
                ) {
                  this.frmReservSpot
                    .get(customLocationInput.name)
                    .setValue(input.value.split(","));
                } else if (
                  customLocationInput.type === "Checkbox" &&
                  input.value === "true"
                ) {
                  this.frmReservSpot
                    .get(customLocationInput.name)
                    .setValue(true);
                } else if (
                  customLocationInput.type === "Checkbox" &&
                  input.value === "false"
                ) {
                  this.frmReservSpot
                    .get(customLocationInput.name)
                    .setValue(false);
                } else {
                  this.frmReservSpot
                    .get(customLocationInput.name)
                    .setValue(input.value);
                }
              }
            });
          });
        }

        if (this.customBookingLocationInputs) {
          this.customBookingLocationInputs.forEach((customLocationInput) => {
            this.bookingInputDetails.forEach((input) => {
              if (
                input.bookingId === this.endUserData.id &&
                input.locationInputId === customLocationInput.id
              ) {
                if (
                  customLocationInput.type === "Selection" &&
                  customLocationInput.multiple
                ) {
                  this.frmReservSpot
                    .get(customLocationInput.name)
                    .setValue(input.value.split(","));
                } else if (
                  customLocationInput.type === "Checkbox" &&
                  input.value === "true"
                ) {
                  this.frmReservSpot
                    .get(customLocationInput.name)
                    .setValue(true);
                } else if (
                  customLocationInput.type === "Checkbox" &&
                  input.value === "false"
                ) {
                  this.frmReservSpot
                    .get(customLocationInput.name)
                    .setValue(false);
                } else {
                  this.frmReservSpot
                    .get(customLocationInput.name)
                    .setValue(input.value);
                }
              }
            });
          });
        }
      });
  }

  getStatus() {
    this.dashboardService.getStatus().subscribe((result) => {
      this.status = result;
    });
  }

  private createForm() {
    this.frmReservSpot = this.fb.group({
      email: [
        null,
        [ValidationService.emailValidator, Validators.maxLength(50)],
      ],
      phone: [null, [Validators.required, Validators.maxLength(20)]],
      name: ["", [Validators.maxLength(50)]],
      partySize: [null],
      status: [null],
      locationId: ["", [Validators.required]],
      userId: [""],
      bookingInput: [[]],
      userInput: [[]],
    });
  }

  private GetLocationData() {
    // code for fetching lat,long from location
    this.locationData = this.endUserData.location;

    this.maxPartySize = this.locationData.partySize;

    this.frmReservSpot
      .get("partySize")
      .setValidators([Validators.max(this.maxPartySize), Validators.min(1)]);
    this.frmReservSpot.get("partySize").updateValueAndValidity();
    this.frmReservSpot.get("partySize").setValue(this.partySize);

    if (
      this.locationData.locationInput.some(
        (locationInput) => locationInput.availableFor === "Booking"
      )
    ) {
      this.customeBookingInput = true;
      this.customBookingLocationInputs = this.locationData.locationInput.filter(
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
          value: this.frmReservSpot
            .get(customLocationInput.name)
            .value.toString(),
        });
      });
    }
    if (this.customUserLocationInputs) {
      this.customUserLocationInputs.forEach((customLocationInput) => {
        this.frmSignUpInput.push({
          locationInputId: customLocationInput.id,
          value: this.frmReservSpot
            .get(customLocationInput.name)
            .value.toString(),
        });
      });
    }
    this.frmReservSpot.get("bookingInput").setValue(this.frmReserveInput);
    this.frmReservSpot.get("userInput").setValue(this.frmSignUpInput);

    this.error = null;

    this.publicService
      .endUserUpdate(this.endUserData.userId, this.frmReservSpot.value)
      .subscribe(
        (result) => {},
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
    this.dashboardService
      .updateBooking(this.bookingId, this.frmReservSpot.value)
      .subscribe(
        (result) => {
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
            this.error = { error: ["Please check your internet connection."] };
          }
        }
      );
  }

  toggle(event) {
    if (!this.isEditMode) {
      event.preventDefault();
    }
  }

  close() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }

  edit() {
    this.isEditMode = true;
  }
}
