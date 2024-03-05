import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AccountService } from "../account.service";
import { LocationInput, LocationInputType } from "@app-models";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NotificationService } from "@app-core";
import { MatChipInputEvent } from "@angular/material";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

@Component({
  templateUrl: "./edit_customer_info.component.html",
  styleUrls: ["./edit_customer_info.component.scss"],
})
export class EditCustomerInfoComponent implements OnInit {
  frmLocationInput: FormGroup;
  isFormSubmitted: boolean;
  isEditMode: boolean;
  error: any;
  public onClose = new Subject();
  locationInputTypes: LocationInputType[] = [];
  selectedLocationInputType: string;
  isLoaded: boolean = false;
  availability = ["Public", "Private"];
  availableFor = ["User", "Booking"];
  selectedAvailability = "Private";
  selectedAvailableFor = "User";
  locationId: number;
  locationInput: LocationInput;

  default: boolean = false;
  placeholder: boolean = false;
  options: boolean = false;
  preselect: boolean = false;
  optionsType = [];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  defaultvalue: string;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

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
      locationId: ["", [Validators.required]],
      name: [null, [Validators.required, Validators.maxLength(50)]],
      label: [null],
      type: [[]],
      options: [[]],
      placeholder: [null],
      defaultInput: [null],
      defaultValue: [null],
      availableFor: [""],
      availability: [""],
      required: [null],
      preselect: [null],
      multiple: [null],
    });
  }

  ngOnInit(): void {
    this.onClose = new Subject();
    this.accountService.getLocationInputType().subscribe((result) => {
      result.forEach((item) => {
        this.locationInputTypes.push({ name: item });
      });
      this.isLoaded = true;

      if (this.isEditMode) {
        if (this.locationInput.options) {
          this.optionsType = this.locationInput.options.split(",");
        }

        this.selectedAvailability = this.locationInput.availability;
        this.selectedAvailableFor = this.locationInput.availableFor;
        this.frmLocationInput.patchValue({ ...this.locationInput });
        this.frmLocationInput.controls.options.setValue("");
        this.frmLocationInput.controls.defaultValue.setValue(
          this.locationInput.defaultInput
        );
        this.selectedLocationInputType = this.locationInput.type;
        this.defaultvalue = this.locationInput.defaultInput;
      } else {
        this.selectedLocationInputType = this.locationInputTypes[0].name;
      }
      this.getTypes();
    });
  }

  getTypes() {
    if (
      this.selectedLocationInputType === "Text Field" ||
      this.selectedLocationInputType === "Text Area" ||
      this.selectedLocationInputType === "Number"
    ) {
      this.default = true;
      this.placeholder = true;
      this.options = false;
      this.preselect = false;
    } else if (this.selectedLocationInputType === "Selection") {
      this.default = false;
      this.placeholder = true;
      this.options = true;
      this.preselect = false;
    } else if (this.selectedLocationInputType === "Date") {
      this.default = false;
      this.placeholder = false;
      this.options = false;
      this.preselect = false;
    } else if (this.selectedLocationInputType === "Checkbox") {
      this.default = false;
      this.placeholder = false;
      this.options = false;
      this.preselect = true;
    } else if (this.selectedLocationInputType === "URL") {
      this.default = false;
      this.placeholder = true;
      this.options = false;
      this.preselect = false;
    }
  }

  setDefault() {
    this.frmLocationInput.controls.defaultInput.setValue(this.defaultvalue);
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || "").trim()) {
      this.optionsType.push(value.trim());
    }
    if (input) {
      input.value = "";
    }
  }

  remove(opt) {
    const index = this.optionsType.indexOf(opt);

    if (index >= 0) {
      this.optionsType.splice(index, 1);
    }
  }

  save() {
    this.frmLocationInput.controls.options.setValue(
      this.optionsType.toString()
    );
    if (this.isEditMode) {
      this.accountService
        .editLocationInput(this.locationInput.id, this.frmLocationInput.value)
        .subscribe(
          (result) => {
            this.notificationService.success(
              `${this.frmLocationInput.get("name")} updated successfully.`
            );

            this.close();
          },
          (error) => {
            if (error && error.status === 400) {
              this.error = error.error ? error.error.modelState || null : null;
            } else if (error && error.status === 500) {
              this.error = {
                error: ["Something went wrong. Please try again later."],
              };
            } else if (error.status === 401) {
              this.error = { error: [error.error.message] };
            } else {
              this.error = {
                error: ["Please check your internet connection."],
              };
            }
          }
        );
    } else {
      this.frmLocationInput.controls.locationId.setValue(this.locationId);
      this.accountService
        .addLocationInput(this.frmLocationInput.value)
        .subscribe(
          (result) => {
            this.notificationService.success("New Field added successfully.");
            this.close();
          },
          (error) => {
            if (error && error.status === 400) {
              this.error = error.error ? error.error.modelState || null : null;
            } else if (error && error.status === 500) {
              this.error = {
                error: ["Something went wrong. Please try again later."],
              };
            } else if (error.status === 401) {
              this.error = { error: [error.error.message] };
            } else {
              this.error = {
                error: ["Please check your internet connection."],
              };
            }
          }
        );
    }
  }

  close() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }

  delete() {
    this.accountService
      .deleteLocationInput(this.locationInput.id)
      .subscribe((result) => {
        this.onClose.next(false);
        this.bsModalRef.hide();
      });
  }
}
