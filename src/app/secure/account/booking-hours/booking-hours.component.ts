import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AccountService } from "../account.service";
import { BbCalendar } from "@app-models";
import { NotificationService } from "@app-core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { PublicService } from "src/app/public/public.service";
import { DailogexampleComponent } from "../../dailogexample/dailogexample.component";

@Component({
  templateUrl: "./booking-hours.component.html",
  styleUrls: ["./booking-hours.component.css"],
})
export class BookingHoursComponent implements OnInit {
  error: any;
  public onClose: Subject<{ calendar: BbCalendar }>;
  locationId;
  openingInfo;
  status;
  storeBooking: boolean = false;
  statusData = [];
  weekDays = [];
  frmOpening: FormGroup;
  isOpeningFormSubmitted: boolean;

  isLoaded: boolean = false;

  constructor(
    private accountService: AccountService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private publicService: PublicService
  ) {
    this.createForm();
  }
  private createForm() {
    this.frmOpening = this.fb.group({
      frmSunday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        slotMin: [""],
        startDate: [""],
        endDate: [""],
        maxPartySize: [""],
        bbTime: this.fb.array([]),
        isDeleted: [""],
      }),
      frmMonday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        slotMin: [""],
        startDate: [""],
        endDate: [""],
        maxPartySize: [""],
        bbTime: this.fb.array([]),
        isDeleted: [""],
      }),
      frmTuesday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        slotMin: [""],
        startDate: [""],
        endDate: [""],
        maxPartySize: [""],
        bbTime: this.fb.array([]),
        isDeleted: [""],
      }),
      frmWednesday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        slotMin: [""],
        startDate: [""],
        endDate: [""],
        maxPartySize: [""],
        bbTime: this.fb.array([]),
        isDeleted: [""],
      }),
      frmThursday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        slotMin: [""],
        startDate: [""],
        endDate: [""],
        maxPartySize: [""],
        bbTime: this.fb.array([]),
        isDeleted: [""],
      }),
      frmFriday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        slotMin: [""],
        startDate: [""],
        endDate: [""],
        maxPartySize: [""],
        bbTime: this.fb.array([]),
        isDeleted: [""],
      }),
      frmSaturday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        slotMin: [""],
        startDate: [""],
        endDate: [""],
        maxPartySize: [""],
        bbTime: this.fb.array([]),
        isDeleted: [""],
      }),
    });
  }

  ngOnInit(): void {
    this.onClose = new Subject();

    this.getStatus();
  }
  //get Status and OpeningHours for store
  //Chnaged by Tushar ==> if storeBooking is true than get data from Bussiness-booking data else from waitlist data
  async getStatus() {
    await this.accountService.getStatus().subscribe(async (result) => {
      this.statusData = result;
      await this.accountService
        .getBbOpeningHours(this.locationId)
        .subscribe((result: BbCalendar[]) => {
          if (result && result.length > 0) {
            result.forEach((element) => {
              var index = this.openingInfo.findIndex(
                (info) => info.weekDay === element.weekDay
              );
              this.openingInfo[index] = element;
            });
            this.customer_info();
          } else {
            this.new_info();
          }
        });
    });
  }

  getUpdateData() {
    if (this.openingInfo) {
      this.accountService
        .deleteBbcalenderdata(this.locationId)
        .subscribe((result) => {
          if (result) {
            this.save();
          }
        });
    } else {
      this.save();
    }
  }

  async new_info() {
    this.openingInfo.forEach((calendar) => {
      this.frmOpening.get("frm" + calendar.weekDay).patchValue({ ...calendar });
      calendar.bbTime.forEach((cal) => {
        // if (cal.calendarId === calendar.id && cal.isDeleted === false) {
        const newTime = this.fb.group({
          calendarId: [""],
          openTime: [""],
          closeTime: [""],
        });
        newTime.patchValue({ ...cal });
        (
          this.frmOpening
            .get("frm" + calendar.weekDay)
            .get("bbTime") as FormArray
        ).push(newTime);
        // }
      });
    });
    this.isLoaded = true;
  }

  async customer_info() {
    this.openingInfo.forEach((calendar) => {
      this.frmOpening.get("frm" + calendar.weekDay).patchValue({ ...calendar });
      calendar.bbTime.forEach((cal) => {
        if (
          this.locationId === 0 ||
          (cal.calendarId === calendar.id && cal.isDeleted === false)
        ) {
          const newTime = this.fb.group({
            calendarId: [""],
            openTime: [""],
            closeTime: [""],
          });
          newTime.patchValue({ ...cal });
          (
            this.frmOpening
              .get("frm" + calendar.weekDay)
              .get("bbTime") as FormArray
          ).push(newTime);
        }
      });
    });
    this.isLoaded = true;
  }

  async save() {
    if (this.status !== "add-edit") {
      for (let item in this.frmOpening.controls) {
        const res: BbCalendar = this.frmOpening.controls[item].value;
        this.accountService.createBbCalendar(res).subscribe((result) => {});
      }
    } else {
      this.openingInfo = [];
      Object.keys(this.frmOpening.controls).forEach((key) => {
        this.openingInfo.push(this.frmOpening.get(key).value);
      });

      this.onClose.next(this.openingInfo);
    }
    this.bsModalRef.hide();
  }

  cancelSlot() {
    let bsModalRef: BsModalRef;

    this.publicService
      .getBbAllBookingByLocationId(this.locationId)
      .subscribe((results) => {
        let temparry = results.filter((value) => {
          if (value.status == "Waiting") {
            return value;
          }
        });
        if (temparry && temparry.length > 0) {
          bsModalRef = this.modalService.show(DailogexampleComponent, {
            backdrop: true,
            ignoreBackdropClick: true,
            class: "modal-dialog-centered",
          });
          bsModalRef.content.onClose.subscribe((result) => {
            if (result) {
              this.publicService
                .cancelALlBooking(this.locationId)
                .subscribe((cancelResult) => {
                  if (cancelResult) {
                    return {
                      message: "all data canceld succesfully",
                    };
                  }
                });
            }
          });
        } else {
          this.getUpdateData();
        }
      });
  }

  close() {
    if (this.status !== "add-edit") {
      this.onClose.next();
      this.bsModalRef.hide();
    } else {
      this.bsModalRef.hide();
    }
  }

  get timeArrays() {
    let ret = {};
    ret["Sunday"] = this.frmOpening.controls.frmSunday.get(
      "bbTime"
    ) as FormArray;
    ret["Monday"] = this.frmOpening.controls.frmMonday.get(
      "bbTime"
    ) as FormArray;
    ret["Tuesday"] = this.frmOpening.controls.frmTuesday.get(
      "bbTime"
    ) as FormArray;
    ret["Wednesday"] = this.frmOpening.controls.frmWednesday.get(
      "bbTime"
    ) as FormArray;
    ret["Thursday"] = this.frmOpening.controls.frmThursday.get(
      "bbTime"
    ) as FormArray;
    ret["Friday"] = this.frmOpening.controls.frmFriday.get(
      "bbTime"
    ) as FormArray;
    ret["Saturday"] = this.frmOpening.controls.frmSaturday.get(
      "bbTime"
    ) as FormArray;

    return ret;
  }

  statusChange(event, weekDay: string) {
    var index = this.openingInfo.findIndex((info) => info.weekDay === weekDay);
    this.frmOpening
      .get("frm" + weekDay)
      .get("status")
      .setValue(event.target.value);
    this.openingInfo[index].status = event.target.value;
  }

  addTime(weekDay: string, id: number) {
    const val = this.timeArrays[weekDay].value;
    const openTime =
      val[val.length - 1]["closeTime"].split(":")[0] +
      ":" +
      val[val.length - 1]["closeTime"].split(":")[1];
    const closeTime =
      String(
        parseInt(val[val.length - 1]["closeTime"].split(":")[0]) + 1
      ).padStart(2, "0") +
      ":" +
      val[val.length - 1]["closeTime"].split(":")[1];
    const newTime = this.fb.group({
      calendarId: [id],
      openTime: [openTime],
      closeTime: [closeTime],
    });
    this.timeArrays[weekDay].push(newTime);
  }

  removeTime(weekDay: string, index: number) {
    this.timeArrays[weekDay].removeAt(index);
  }
}
