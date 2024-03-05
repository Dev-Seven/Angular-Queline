import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Activity, EndUser, LocationInput, UserInput } from "@app-models";
import { ActivityService } from "../activity.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ActivityMapComponent } from "../activity_map/activity_map.component";
import { FeedbackComponent } from "../feedback/feedback.component";
import { CommonService } from "src/app/common.service";
import { Router } from "@angular/router";
import { UserAuthService, CommonUtility, NotificationService } from "@app-core";
import { AccountService } from "../../account/account.service";
import { Location, User } from "@app-models";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PublicService } from "src/app/public/public.service";
import { Keys } from "@swimlane/ngx-datatable";

@Component({
  templateUrl: "./list.component.html",
  styleUrls: ["list.component.scss"],
})
export class ActivityListComponent implements OnInit, AfterViewInit {
  activityData: Activity[] = [];
  page: number = 1;
  data = [];
  searchData: { [key: string]: any } = {};
  loading: boolean;
  bsModalRef: BsModalRef;
  userBookingDetails = [];
  locationData: Location[] = [];
  companyId: number;
  currentPlan;
  planid: number;
  isBusinessOwner: boolean = false;
  planDetails = { plan: 0 };
  user: User;
  @ViewChild("datatable") content: ElementRef;
  dataRefresher: NodeJS.Timeout;
  error: any;
  locationinputData: LocationInput[];

  constructor(
    private activityService: ActivityService,
    private modalService: BsModalService,
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private accountService: AccountService,
    private userAuthService: UserAuthService,
    private notificationService: NotificationService,
    private publicService: PublicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.userAuthService.getUser();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
    this.companyId = this.user.id;
    this.getLocations();
    this.getActivityData();
    this.getPlanDetails();
    this.commonService.load([{ name: "hs.datatables", canReload: true }]);
  }
  getLocations() {
    this.accountService
      .getLocationsByCompany(this.companyId)
      .subscribe((result: Location[]) => {
        this.locationData = result;

        this.locationData.map(
          (t) =>
            (this.locationinputData = t.locationInput.filter(
              (u) =>
                u.availableFor === "Booking" &&
                u.isDeleted === false &&
                u.enabled == true
            ))
        );
        if (this.isBusinessOwner && CommonUtility.isEmpty(this.locationData)) {
          this.notificationService.info("Please add store details");
          this.router.navigateByUrl("secure/account/store/new");
          return;
        }
      });
    // this.dataRefresher = setInterval(() => {
    this.getActivityData();
    // }, 15000);
  }
  getBookingDetails(id) {
    // console.log('dadasahysa')
    let bookingDetails = [];
    this.userBookingDetails = [];
    this.publicService.bookingData(id).subscribe((result) => {
      bookingDetails = result.bookingDetails;
      if (result) {
        let uniqueArray = [
          ...bookingDetails
            .reduce((map, val) => {
              if (!map.has(val.locationInputId)) {
                map.set(val.locationInputId, val);
              }
              return map;
            }, new Map())
            .values(),
        ];
        result.location.locationInput.map((loc) => {
          uniqueArray.map((book) => {
            if (loc.id === book.locationInputId) {
              this.userBookingDetails.push({
                label: loc.label,
                value: book.value,
              });
            }
          });
        });
      } else {
      }
    });
  }
  getPlanDetails() {
    const businessDetails = this.accountService
      .getBusinessSports({ business_id: this.companyId })
      .subscribe((result) => {
        this.planDetails = result;
        if (this.planDetails.plan == 1) {
          this.currentPlan = "Basic";
          this.planid = 1;
        } else if (this.planDetails.plan == 2) {
          this.currentPlan = "Starter";
          this.planid = 2;
        } else {
          this.currentPlan = "Enterprice";
          this.planid = 3;
        }
      });
  }
  ngAfterViewInit() {}
  async importData(file: FileList) {
    let keys;
    let fileData = [];

    await this.activityService.changeListener(file).then((result) => {
      result.header.map((head) => {
        keys = head.toString().split(",");
        keys = keys.filter((value) => value !== "S.No");
      });
      result.rows[0].forEach((row) => {
        let obj = {};
        if (row) {
          let value = row.toString().split(",");
          value = value.slice(1);

          keys.map((key, i) => {
            obj[key] = value[i];
          });
          fileData.push(obj);
        }
      });
    });

    let userInputs: UserInput[] = [];
    this.locationinputData.map((input) => {
      userInputs.push({
        locationInputId: input.id,
        userId: 0,
        value: "",
      });
    });

    fileData.map((user) => {
      const userData: EndUser = {
        email: user.email,
        name: user.username,
        phone: user.phone,
        userDetails: userInputs,
        deviceToken: user.deviceToken,
      };
      this.publicService.endUserSignIn(userData).subscribe(
        (result) => {
          this.notificationService.success("Details updated successfully!!");
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
    });
    this.getActivityData();
  }
  savePDF() {
    const data = this.activityData;
    let companyName = data[0].companyName;
    let doc = new jsPDF();
    autoTable(doc, { html: "#datatable" });
    doc.save(companyName);
  }
  saveCSV() {
    const data = this.activityData;
    let companyName = data[0].companyName;
    const columns = [
      "companyName",
      "location",
      "username",
      "visits",
      "phone",
      "email",
      "lastVisited",
    ];
    const rows = [];
    data.map((obj) => {
      rows.push({
        companyName: obj.companyName,
        location: obj.location,
        username: obj.username,
        visits: obj.visits,
        phone: obj.phone,
        email: obj.email,
        lastVisited: obj.lastVisited,
      });
    });
    this.activityService.downloadFile(rows, companyName, columns);
  }
  private getActivityData() {
    this.activityService.getActivities().subscribe((result: Activity[]) => {
      this.activityData = result || [];
      this.commonService.load([{ name: "custom", canReload: true }]);
      this.ref.detectChanges();
    });
  }
  updateSearch(search: { [key: string]: any }) {
    this.searchData = Object.assign({}, search);
  }
  isDeletedRow(row) {
    return {
      "text-danger": !row.isDeleted,
    };
  }
  viewMap(event, activity) {
    const initialState = {
      activityData: activity,
    };
    this.bsModalRef = this.modalService.show(ActivityMapComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    this.bsModalRef.content.onClose.subscribe((result: any) => {});
  }
  viewFeedback(event, activity) {
    const initialState = {
      booking: activity,
    };
    this.bsModalRef = this.modalService.show(FeedbackComponent, {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState,
    });
    this.bsModalRef.content.onClose.subscribe((result) => {
      this.ngOnInit();
    });
  }
  pageChanged(event) {
    this.page = event;
  }
}
