import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AccountService } from "../account.service";
import { LocationInput } from "@app-models";
import { EditCustomerInfoComponent } from "../edit_customer_info/edit_customer_info.component";
import { EditDefaultCustomerInfoComponent } from "../edit_default_customer_info/edit_default_customer_info.component";
import { NotificationService } from "@app-core";

@Component({
  templateUrl: "./customer_info.component.html",
  styleUrls: ["./customer_info.component.scss"],
})
export class CustomerInfoComponent implements OnInit {
  error: any;
  public onClose = new Subject();
  locationId;
  locationInfo;

  customerInfo: LocationInput[] = [];
  customerDefaultInfo;

  constructor(
    private accountService: AccountService,
    private modalService: BsModalService,
    private notificationService: NotificationService,
    public bsModalRef: BsModalRef,
    public bsModalRef1: BsModalRef
  ) {}

  ngOnInit(): void {
    this.onClose = new Subject();
    this.customerInfo = [];
    this.customer_info();
  }

  customer_info() {
    this.accountService.getById(this.locationId).subscribe((location) => {
      this.locationInfo = location;
      this.customerDefaultInfo = [
        { name: "Name", required: location.isNameRequired },
        { name: "Email", required: location.isEmailRequired },
        { name: "Phone", required: location.isPhoneRequired },
        { name: "Party Size", required: location.isPartySizeRequired },
      ];
      location.locationInput.forEach((locationInput) => {
        if (!locationInput.isDeleted) {
          this.customerInfo.push(locationInput);
        }
      });
    });
  }

  close() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }

  editDefaultInfo(info) {
    const initialState = {
      locationId: this.locationId,
      info,
    };

    this.bsModalRef1 = this.modalService.show(
      EditDefaultCustomerInfoComponent,
      {
        backdrop: true,
        ignoreBackdropClick: true,
        initialState,
      }
    );
    this.bsModalRef1.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }

  editInfo(locationInput: LocationInput) {
    const initialState = { locationInput, isEditMode: true };

    this.bsModalRef1 = this.modalService.show(EditCustomerInfoComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    this.bsModalRef1.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }

  infoChange(info) {
    let locationInputId: number = info.id,
      locationInputName: string = info.name;
    this.accountService
      .enableLocationInput(locationInputId)
      .subscribe((result) => {
        this.notificationService.success(
          `${locationInputName} updated successfully.`
        );
        this.ngOnInit();
      });
  }

  addInfo() {
    const initialState = { isEditMode: false, locationId: this.locationId };

    this.bsModalRef1 = this.modalService.show(EditCustomerInfoComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    this.bsModalRef1.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }
}
