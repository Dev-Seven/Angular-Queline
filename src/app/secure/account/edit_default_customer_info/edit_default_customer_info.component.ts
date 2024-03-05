import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AccountService } from "../account.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@app-models";
import { NotificationService } from "@app-core";

@Component({
  templateUrl: "./edit_default_customer_info.component.html",
  styleUrls: ["./edit_default_customer_info.component.scss"],
})
export class EditDefaultCustomerInfoComponent implements OnInit {
  frmLocationInput: FormGroup;
  isFormSubmitted: boolean;
  error: any;
  public onClose = new Subject();
  info;
  name: string;
  required: boolean;
  locationId: number;
  locationData: Location;
  isPartySize: boolean = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private notificationService: NotificationService,
    public bsModalRef: BsModalRef
  ) {
    this.createForm();
  }

  private createForm() {
    this.frmLocationInput = this.fb.group({
      partySize: [1],
      required: [null],
    });
  }

  ngOnInit(): void {
    this.onClose = new Subject();
    this.name = this.info.name;
    this.required = this.info.required;
    this.accountService.getById(this.locationId).subscribe(
      (data) => {
        this.locationData = data;
        if (this.name === "Name") {
          this.frmLocationInput.controls.required.setValue(
            this.locationData.isNameRequired
          );
        }
        if (this.name === "Email") {
          this.frmLocationInput.controls.required.setValue(
            this.locationData.isEmailRequired
          );
        }
        if (this.name === "Phone") {
          this.frmLocationInput.controls.required.setValue(
            this.locationData.isPhoneRequired
          );
        }
        if (this.name === "Party Size") {
          this.frmLocationInput.controls.required.setValue(
            this.locationData.isPartySizeRequired
          );
          this.frmLocationInput.controls.partySize.setValue(
            this.locationData.partySize
          );
          this.isPartySize = true;
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

  save() {
    if (this.name === "Name") {
      this.locationData.isNameRequired =
        this.frmLocationInput.controls.required.value;
    }
    if (this.name === "Email") {
      if (
        this.locationData.isPhoneRequired === false &&
        this.frmLocationInput.controls.required.value === false
      ) {
        this.notificationService.error(
          "You can not set required false for email and phone both. Please set require true for any one."
        );
        this.close();
        return;
      }
      this.locationData.isEmailRequired =
        this.frmLocationInput.controls.required.value;
    }
    if (this.name === "Phone") {
      if (
        this.locationData.isEmailRequired === false &&
        this.frmLocationInput.controls.required.value === false
      ) {
        this.notificationService.error(
          "You can not set required false for email and phone both. Please set require true for any one."
        );
        this.close();
        return;
      }
      this.locationData.isPhoneRequired =
        this.frmLocationInput.controls.required.value;
    }
    if (this.name === "Party Size") {
      this.locationData.isPartySizeRequired =
        this.frmLocationInput.controls.required.value;
      this.locationData.partySize =
        this.frmLocationInput.controls.partySize.value;
    }

    this.accountService.update(this.locationId, this.locationData).subscribe(
      (result) => {
        this.close();
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

  close() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }
}
