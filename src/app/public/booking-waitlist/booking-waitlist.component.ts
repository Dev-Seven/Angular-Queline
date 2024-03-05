import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { PublicService } from "../public.service";
import { CommonUtility, APIConstant } from "@app-core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { Location, Slot } from "@app-models";
import { HelperService } from "../services/helper/helper.service";
import { EncrDecrServiceService } from "src/app/service/encr-decr-service.service";
import { environment } from "src/environments/environment";

@Component({
  templateUrl: "./booking-waitlist.component.html",
  styleUrls: ["./booking-waitlist.component.css"],
})
export class BookingWaitlistComponent implements OnInit {
  isFormSubmitted: boolean;
  email: boolean = false;
  zoom = 18;
  error: any;
  center: google.maps.LatLngLiteral;
  location: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    mapTypeId: "roadmap",
  };
  markers = [];
  lat: number = 0;
  lng: number = 0;
  locationId: number;
  locationData: Location;
  theme: string;
  branding: boolean = true;
  chatting: boolean = true;

  locationQrId: string;
  bookingId: number;
  companyLogo: string = null;
  basePath: string = APIConstant.basePath + "api/";
  totalSeconds: number = 0;
  minutes: number;
  seconds: number;
  storeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  closeMessage: string;
  isCancel: boolean = false;
  spotId: number;
  isList: boolean = true;
  waitlist = [];
  qrcode;
  waitTime: number = 0;
  avgWaitTime: number = 0;

  private routerSub: Subscription;
  businessname: string;
  normalWaitingTime: number;
  stopApiCall: boolean = true;
  dataRefresher: any;
  secondRefresher: any;

  slotData: Slot;
  bookedDate: string;
  bookedSlot: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private publicService: PublicService,
    // private encrDecrService: EncrDecrServiceService,
    private helperService: HelperService,
    private notificationService: ToastrService
  ) {}

  ngOnInit(): void {
    this.routerSub = this.activatedRoute.params.subscribe(
      ({ id, locationId }) => {
        // console.log(
        //   "Decrypted",
        //   this.encrDecrService.get(environment.encryptKey, locationId)
        // );
        // locationId = this.encrDecrService.get(
        //   environment.encryptKey,
        //   locationId
        // );
        // id = this.encrDecrService.get(environment.encryptKey, id);
        if (this.isNumber(id)) {
          if (CommonUtility.isNotEmpty(id)) {
            this.locationQrId = locationId;
            localStorage.setItem("locationQrId", this.locationQrId);
            this.GetLocationData(locationId);
          }
          if (CommonUtility.isNotEmpty(locationId)) {
            this.bookingId = id;
            this.isList = false;
            this.GetBookingData();
          }
        } else {
          if (CommonUtility.isNotEmpty(id)) {
            this.businessname = id;
            this.locationQrId = locationId;
            localStorage.setItem("locationQrId", this.locationQrId);
            this.GetLocationWaitlist(
              this.businessname + "/" + this.locationQrId
            );
          }
        }
      }
    );
    this.helperService.isRefreshWaitList().subscribe((res) => {
      if (res[0] === true) {
        this.GetBookingData();
      }
    });
  }

  // cancelPageRefresh() {
  //   if (this.dataRefresher) {
  //     // clearInterval(this.dataRefresher);
  //   }
  // }

  isNumber(n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
  }

  private GetLocationData(locationId) {
    this.publicService.locationDataByQr(locationId).subscribe((result) => {
      this.locationId = result.id;
      this.locationData = result;

      this.qrcode = result.qrCodeURL;
      this.theme = this.locationData.theme;
      this.branding = this.locationData.branding;
      this.chatting = this.locationData.chatting;

      if (result.businessAdmin.profilepic !== null) {
        this.companyLogo =
          this.basePath + "location/files/image/" + result.image;
      } else {
        this.companyLogo = null;
      }
      if (!this.bookingId) {
        if (this.locationData.isPublicWaitList) {
          this.publicService
            .getChatUsers(this.locationId)
            .subscribe((result) => {
              this.waitlist = result;
              this.waitlist.forEach((user) => {
                user.bookingTime = Math.floor(
                  (new Date().getTime() -
                    new Date(user.bookingTime).getTime()) /
                    1000 /
                    60
                );
                this.waitTime += user.bookingTime;
              });
              if (this.waitlist.length > 0) {
                this.avgWaitTime = this.waitTime / this.waitlist.length;
              }
              this.ref.detectChanges();
            });
        } else {
          this.goToReserveSpot();
        }
      }

      this.lat = Number(result.latitude);
      this.lng = Number(result.longitude);
      this.ref.detectChanges();
      this.storeName = result.businessAdmin.companyName;

      this.address = result.address;
      this.city = result.city;
      this.state = result.state;
      this.zipCode = result.zipCode;
      this.country = result.country;

      navigator.geolocation.getCurrentPosition((x) => {
        this.center = {
          lat: x.coords.latitude,
          lng: x.coords.longitude,
        };

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        var geocoder = new google.maps.Geocoder();

        const map = new google.maps.Map(
          document.getElementById("map") as HTMLElement,
          {
            zoom: 6,
            center: new google.maps.LatLng(this.center.lat, this.center.lng),
          }
        );
        const request = {
          origin: new google.maps.LatLng(this.center.lat, this.center.lng),
          destination: new google.maps.LatLng(this.lat, this.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        };
        directionsService.route(request, (response, status) => {
          if (status === "OK") {
            directionsRenderer.setMap(map);
            directionsRenderer.setDirections(response);
          } else {
            window.alert("Directions request failed due to " + status);
          }
        });
      });
    });
  }

  private GetLocationWaitlist(locationId) {
    this.publicService.getWaitlist(locationId).subscribe((result) => {
      this.locationId = result.id;
      this.locationData = result;
      this.qrcode = result.qrCodeURL;
      this.theme = this.locationData.theme;
      this.branding = this.locationData.branding;
      this.chatting = this.locationData.chatting;

      if (result.businessAdmin.profilepic !== null) {
        this.companyLogo =
          this.basePath + "location/files/image/" + result.image;
      } else {
        this.companyLogo = null;
      }
      if (!this.bookingId) {
        if (this.locationData.isPublicWaitList) {
          this.publicService
            .getChatUsers(this.locationId)
            .subscribe((result) => {
              this.waitlist = result;
              this.waitlist.forEach((user) => {
                user.bookingTime = Math.floor(
                  (new Date().getTime() -
                    new Date(user.bookingTime).getTime()) /
                    1000 /
                    60
                );
                this.waitTime += user.bookingTime;
              });
              if (this.waitlist.length > 0) {
                this.avgWaitTime = this.waitTime / this.waitlist.length;
              }
              this.ref.detectChanges();
            });
        } else {
          this.goToReserveSpot();
        }
      }

      this.lat = Number(result.latitude);
      this.lng = Number(result.longitude);
      this.ref.detectChanges();
      this.storeName = result.businessAdmin.companyName;

      this.address = result.address;
      this.city = result.city;
      this.state = result.state;
      this.zipCode = result.zipCode;
      this.country = result.country;

      navigator.geolocation.getCurrentPosition((x) => {
        this.center = {
          lat: x.coords.latitude,
          lng: x.coords.longitude,
        };

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        var geocoder = new google.maps.Geocoder();

        const map = new google.maps.Map(
          document.getElementById("map") as HTMLElement,
          {
            zoom: 6,
            center: new google.maps.LatLng(this.center.lat, this.center.lng),
          }
        );
        const request = {
          origin: new google.maps.LatLng(this.center.lat, this.center.lng),
          destination: new google.maps.LatLng(this.lat, this.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        };
        directionsService.route(request, (response, status) => {
          if (status === "OK") {
            directionsRenderer.setMap(map);
            directionsRenderer.setDirections(response);
          } else {
            window.alert("Directions request failed due to " + status);
          }
        });
      });
    });
  }

  private GetBookingData() {
    this.publicService
      .getBbBookingByLocationId(this.bookingId)
      .subscribe((result) => {
        this.slotData = result.bbSlot;
        this.bookedDate = new Date(
          result.bookingTime || result?.bookingDate
        ).toDateString();
        this.bookedSlot = (this.slotData || result).slotDuration.replace(
          ",",
          "-"
        );

        this.secondRefresher = setInterval(() => {
          if (result.status === "Cancelled") {
            this.notificationService.warning(
              "Your Booking has been cancelled."
            );
            this.isCancel = true;
            this.closeMessage = `Your in the waitlist for ${this.storeName} has been cancelled successfully`;
            this.isList = true;
            this.router.navigateByUrl(`selectmode/${this.locationQrId}`);
            // this.cancelPageRefresh();
            if (this.secondRefresher) {
              clearInterval(this.secondRefresher);
            }
          }
          if (result.status === "Resolved") {
            this.notificationService.success("Your Booking has been Resolved.");
            this.isCancel = true;
            this.closeMessage = `Your in the waitlist for ${this.storeName} has been Resolved successfully`;
            this.isList = true;
            this.router.navigateByUrl(`selectmode/${this.locationQrId}`);
            // this.cancelPageRefresh();
            if (this.secondRefresher) {
              clearInterval(this.secondRefresher);
            }
          }
        }, 1000);
      });
  }

  newSpot() {
    this.publicService.reReserveBooking(this.bookingId).subscribe(
      (result) => {
        this.notificationService.success(
          "Your new spot has been created successfully."
        );
        // this.router.navigateByUrl(
        //   `waitlist/${result.booking.id}/${this.locationQrId}`
        // );
      },
      (error) => {
        this.notificationService.warning("Please try again.");
      }
    );
  }

  cancelBooking() {
    this.publicService.cancelBbBooking(this.bookingId).subscribe(
      (result) => {
        this.notificationService.success(
          "Your Booking has been cancelled successfully."
        );
        this.isCancel = true;
        this.isList = true;
        this.router.navigateByUrl(`selectmode/${this.locationQrId}`);
        this.helperService.waitList(true, result?.booking?.userId);
      },
      (error) => {
        this.notificationService.warning("Please try again.");
      }
    );
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.isCancel = false;
    // this.cancelPageRefresh();
  }

  goToReserveSpot() {
    this.router.navigateByUrl(`/reservespot/${this.qrcode}`);
  }

  getAverageTime() {
    if (this.stopApiCall) {
      this.publicService.getAverageTime(this.locationId).subscribe((result) => {
        if (result == -1) {
          this.totalSeconds = this.normalWaitingTime;
          this.stopApiCall = false;
        } else {
          this.totalSeconds = result;
        }
      });
    }
  }
}
