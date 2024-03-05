import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { CommonUtility, NotificationService, UserAuthService } from "@app-core";
import { AccountService } from "../account/account.service";
import { ProfileService } from "../profile/profile.service";
import { Location, User } from "@app-models";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { PublicService } from "src/app/public/public.service";

import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from "date-fns";
import { Subject } from "rxjs";

import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from "angular-calendar";
import { HelperService } from "../../public/services/helper/helper.service";

const colors: any = {
  red: {
    primary: "#ad2121",
    secondary: "#FAE3E3",
  },
  blue: {
    primary: "#1e90ff",
    secondary: "#D1E8FF",
  },
  yellow: {
    primary: "#e3bc08",
    secondary: "#FDF1BA",
  },
};
@Component({
  templateUrl: "./booking-list.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ["./booking-list.component.css"],
})
export class BookingListComponent implements OnInit {
  @ViewChild("modalContent", { static: true }) modalContent: TemplateRef<any>;
  locationId;
  bookingData = [];
  isSuperAdmin: boolean;
  isBusinessOwner: boolean;
  isManager: boolean;
  companyId: number;
  locationData: Location[] = [];
  bsModalRef: BsModalRef;
  page: number = 1;
  pageRefresher: any;
  storeUniqueId: string;
  viewDate: Date = new Date();
  calendarView: boolean = true;

  view: CalendarView = CalendarView.Month;
  partySize: number;
  CalendarView = CalendarView;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: `<a
      class="btn-action clr-red"
      *ngIf="row.status === 'Waiting'"
      title="Check In"
      href="javascript:;"
      (click)="checkIn(row.id)"
    >
    <i class="material-icons mat-icon">check_circle</i>
    </a>
   `,
      // a11yLabel: "<mat-icon>check_circle</mat-icon>",
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent("checkIn", event);
      },
    },
    {
      label: ` <a
      class="btn-action"
      *ngIf="row.status === 'Waiting'"
      href="javascript:;"
      title="Cancel"
      (click)="cancelBooking(row.id)"
    >
    <i class="material-icons mat-icon">disabled_by_default</i>
    </a>`,
      // a11yLabel: "Delete",

      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent("cancel", event);
      },
    },
  ];
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;

  constructor(
    private userAuthService: UserAuthService,
    private accountService: AccountService,
    private bsModalService: BsModalService,
    private helperService: HelperService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private publicService: PublicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.helperService.bbBooking_isRefresh().subscribe((res) => {
      if (res == true) {
        this.getBookingData();
        this.joinAlert();
      }
    });

    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
    this.isManager = this.userAuthService.isManager();
    this.companyId = Number(this.userAuthService.getCompanyName());
    this.getLocations();
  }
  //alert sound for new booking
  joinAlert() {
    let audio: HTMLAudioElement = new Audio(
      "../../../assets/sound/toast_sound.mp3"
    );
    this.notificationService.info("New Spot joined!");
    if (this.userAuthService.getUser().waitlistSound) {
      audio.play();
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    if (action === "checkIn") {
      this.checkIn(event.meta.id);
      this.getCalendarData();
    } else if (action === "cancel") {
      this.cancelBooking(event.meta.id);
    }
  }

  getLocations() {
    if (this.isSuperAdmin || this.isBusinessOwner) {
      this.accountService
        .getLocationsByCompany(this.companyId)
        .subscribe((result) => {
          this.locationData = result;

          if (this.isSuperAdmin) {
            this.locationData = this.locationData.filter(
              (t) => t.businessAdminId === this.companyId
            );
          }

          this.locationData = this.locationData.filter((t) =>
            CommonUtility.isNotEmpty(t.name)
          );

          this.userAuthService.saveCompanyName(this.companyId.toString());
          if (CommonUtility.isNotEmpty(this.locationData)) {
            if (
              this.userAuthService.getLocationName() &&
              this.locationData.find(
                (loc) =>
                  loc.id === Number(this.userAuthService.getLocationName())
              )
            ) {
              this.locationId = Number(this.userAuthService.getLocationName());
            } else {
              this.locationId = this.locationData[0].id;
            }
          } else if (
            this.isBusinessOwner &&
            CommonUtility.isEmpty(this.locationData)
          ) {
            this.notificationService.info("Please add store details");
            this.router.navigateByUrl("secure/account/store/new");
            return;
          } else {
          }
          this.selectLocation();
          this.getBookingData();
        });
    } else {
      this.locationData = [];
      const user: User = this.userAuthService.getUser();

      if (CommonUtility.isNotEmpty(user)) {
        this.profileService.getById(user.id).subscribe((userData: User) => {
          if (
            CommonUtility.isNotEmpty(userData) &&
            CommonUtility.isNotEmpty(userData.locationAdmin)
          ) {
            this.locationData.push(userData.locationAdmin[0]);
            if (this.userAuthService.getLocationName()) {
              this.locationId = Number(this.userAuthService.getLocationName());
            } else {
              this.locationId = this.locationData[0].id;
            }
          }
        });
      }
    }
    // this.pageRefresher = setInterval(() => {
    // this.getBookingData();
    // }, 10000);
  }

  //Chnage View for calendar or List
  openCalendar() {
    this.calendarView = this.calendarView == true ? false : true;
  }
  //Get Booking are waiting or cancel
  getBookingData() {
    let latestSpotdata = [];

    if (CommonUtility.isNotNull(this.locationId)) {
      this.accountService.getBbBookingsByLocationId(this.locationId).subscribe(
        (result) => {
          result.map((t) => {
            if (t.status === "Serving" || t.status === "Waiting") {
              latestSpotdata.push(t);
            }
          });
          this.bookingData = latestSpotdata;

          this.getCalendarData();
        },
        (error) => {}
      );
    }
  }
  getCalendarData() {
    this.events = [];
    if (this.bookingData) {
      this.bookingData.forEach((book) => {
        this.events.push({
          start: new Date(book.bookingDate),
          title: `Booked Slot for ${book.slotDuration.replace(",", "-")}`,
          end: startOfDay(new Date(book.bookingTime)),
          color: colors.yellow,
          actions: this.actions,
          meta: { id: book.id },
        });
      });
    }
  }

  //change location and get Booking data from locatoin
  selectLocation() {
    if (CommonUtility.isNotEmpty(this.locationId)) {
      var location = this.locationData.find((t) => t.id == this.locationId);
      this.userAuthService.saveLocation(this.locationId.toString());
      if (location.image) {
        this.userAuthService.saveLocationLogo(location.image);
      } else {
        this.userAuthService.saveLocationLogo("");
      }
      this.storeUniqueId = location.qrCodeURL.toString();
      this.getBookingData();
    }
  }

  //CheckOut User From admin
  checkIn(bookingId: number) {
    // const index = this.bookingData.findIndex((i2) => i2.id === bookingId);
    // if (this.bookingData[index].status == "Waiting") {
    //   this.bookingData[index].status = "Serving";
    // }

    this.accountService.checkInBbBooking(bookingId).subscribe(
      (result) => {
        this.notificationService.success("Checked In successfully.");
        this.getBookingData();
      },
      (error) => {
        this.notificationService.warning("Please try again.");
        this.getBookingData();
      }
    );
  }

  //CheckOut User From admin
  checkOut(bookingId: number) {
    // const index = this.bookingData.findIndex((i2) => i2.id === bookingId);
    // if (this.bookingData[index].status == "Serving") {
    //   this.bookingData.splice(index, 1);
    // }
    this.accountService.checkOutBbBooking(bookingId).subscribe(
      (result) => {
        this.notificationService.success("Checked Out successfully.");
        this.getBookingData();
      },
      (error) => {
        this.notificationService.warning("Please try again.");
        this.getBookingData();
      }
    );
  }

  //Cancel booking from admin
  cancelBooking(bookingId: number) {
    this.publicService.cancelBbBooking(bookingId).subscribe(
      (result) => {
        this.notificationService.success(
          "Booking has been cancelled successfully."
        );
        this.getBookingData();
      },
      (error) => {
        this.notificationService.warning("Please try again.");
        this.getBookingData();
      }
    );
  }

  cancelPageRefresh() {
    if (this.pageRefresher) {
      clearInterval(this.pageRefresher);
    }
  }

  ngOnDestroy() {
    this.cancelPageRefresh();
  }

  pageChanged(event) {
    this.page = event;
  }
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent("Dropped or resized", event);
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
