import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AccountService } from "../account.service";
import { Calendar } from "@app-models";
import { NotificationService } from "@app-core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";

@Component({
  templateUrl: "./opening_info.component.html",
  styleUrls: ["./opening_info.component.scss"],
})
export class OpeningInfoComponent implements OnInit {
  error: any;
  public onClose: Subject<{ calendar: Calendar }>;
  locationId;
  openingInfo;
  status;
  statusData = [];
  weekDays = [];
  frmOpening: FormGroup;
  isOpeningFormSubmitted: boolean;

  isLoaded: boolean = false;

  constructor(
    private accountService: AccountService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    public bsModalRef: BsModalRef
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
        time: this.fb.array([]),
        isDeleted: [""],
      }),
      frmMonday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        time: this.fb.array([]),
        isDeleted: [""],
      }),
      frmTuesday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        time: this.fb.array([]),
        isDeleted: [""],
      }),
      frmWednesday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        time: this.fb.array([]),
        isDeleted: [""],
      }),
      frmThursday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        time: this.fb.array([]),
        isDeleted: [""],
      }),
      frmFriday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        time: this.fb.array([]),
        isDeleted: [""],
      }),
      frmSaturday: this.fb.group({
        id: [""],
        locationId: [""],
        weekDay: [""],
        status: [""],
        time: this.fb.array([]),
        isDeleted: [""],
      }),
    });
  }

  ngOnInit(): void {
    this.onClose = new Subject();

    this.getStatus();
  }
  //get Status and OpeningHours for store
  async getStatus() {
    await this.accountService.getStatus().subscribe(async (result) => {
      this.statusData = result;
      if (this.locationId !== 0) {
        await this.accountService
          .getOpeningHours(this.locationId)
          .subscribe((result: Calendar[]) => {
            result.forEach((element) => {
              var index = this.openingInfo.findIndex(
                (info) => info.weekDay === element.weekDay
              );
              this.openingInfo[index] = element;
            });

            this.customer_info();
          });
      } else {
        this.customer_info();
      }
    });
  }

  async customer_info() {
    this.openingInfo.forEach((calendar) => {
      this.frmOpening.get("frm" + calendar.weekDay).patchValue({ ...calendar });
      calendar.time.forEach((cal) => {
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
              .get("time") as FormArray
          ).push(newTime);
        }
      });
    });
    this.isLoaded = true;
  }

  async save() {
    if (this.status !== "add-edit") {
      for (let item in this.frmOpening.controls) {
        const res = this.frmOpening.controls[item].value;
        await this.accountService
          .saveOpeningHours(res["id"], res)
          .subscribe((result) => {});
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
    ret["Sunday"] = this.frmOpening.controls.frmSunday.get("time") as FormArray;
    ret["Monday"] = this.frmOpening.controls.frmMonday.get("time") as FormArray;
    ret["Tuesday"] = this.frmOpening.controls.frmTuesday.get(
      "time"
    ) as FormArray;
    ret["Wednesday"] = this.frmOpening.controls.frmWednesday.get(
      "time"
    ) as FormArray;
    ret["Thursday"] = this.frmOpening.controls.frmThursday.get(
      "time"
    ) as FormArray;
    ret["Friday"] = this.frmOpening.controls.frmFriday.get("time") as FormArray;
    ret["Saturday"] = this.frmOpening.controls.frmSaturday.get(
      "time"
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
