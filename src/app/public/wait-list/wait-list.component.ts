import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { PublicService } from "../public.service";
import { CommonUtility, APIConstant } from "@app-core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription, interval } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { Location } from "@app-models";
import { HelperService } from "../services/helper/helper.service";

@Component({
  templateUrl: "./wait-list.component.html",
  styleUrls: ["./wait-list.component.scss"],
})
export class WaitListComponent implements OnInit {
  subscription: Subscription;
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
  timer: NodeJS.Timeout;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private publicService: PublicService,
    private helperService: HelperService,
    private notificationService: ToastrService
  ) {}

  ngOnInit(): void {
    this.routerSub = this.activatedRoute.params.subscribe(
      ({ id, locationId }) => {
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
            this.GetWaitlistData();
          }
        } else {
          if (CommonUtility.isNotEmpty(id)) {
            this.businessname = id;
            this.locationQrId = locationId;
            localStorage.setItem("locationQrId", this.locationQrId);
            this.GetLocationWaitlist(
              this.businessname + "/" + this.locationQrId
            );
            this.GetWaitlistData();
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
  //     clearInterval(this.dataRefresher);
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

  private GetWaitlistData() {
    this.publicService.getWaitlistData(this.locationId).subscribe((result) => {
      // this.spotId = result.spotId;

      localStorage.setItem("businessAdminId", result.location.businessAdminId);
      this.subscription = interval(1000).subscribe((data) => {
        if (this.totalSeconds > 0) {
          this.totalSeconds--;
          this.minutes = Math.floor(this.totalSeconds / 60);
          this.seconds = this.totalSeconds % 60;
        } else {
          this.isCancel = true;
          this.closeMessage = `Your in the waitlist for ${this.storeName} has been over. Please reserve spot again.`;
        }
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

      if (result.image !== null) {
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
    this.publicService.bookingData(this.bookingId).subscribe((result) => {
      var remainingTime = result.currentWaitTime;
      this.normalWaitingTime = remainingTime;
      this.spotId = result.spotId;
      this.totalSeconds = Math.ceil(remainingTime);
      localStorage.setItem("businessAdminId", result.location.businessAdminId);
      // this.secondRefresher = setInterval(() => {

      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.minutes = Math.floor(this.totalSeconds / 60);

        this.seconds = this.totalSeconds % 60;
      } else {
        this.minutes = 0;
        this.seconds = 0;
        this.isCancel = true;
        this.closeMessage = `Your in the waitlist for ${this.storeName} has been over. Please reserve spot again.`;
      }
      this.GetWaitlistData();
      if (result.status === "Cancelled") {
        this.notificationService.warning("Your spot has been cancelled.");
        this.isCancel = true;
        this.closeMessage = `Your in the waitlist for ${this.storeName} has been cancelled successfully`;
        this.isList = true;
        this.router.navigateByUrl(`waitlist/${this.locationData.checkInUrl}`);
        // this.cancelPageRefresh();
        // if (this.secondRefresher) {
        //   clearInterval(this.secondRefresher);
        // }
      }
      if (result.status === "Resolved") {
        this.notificationService.warning(
          `Your in the waitlist for ${this.storeName} has been over. Please reserve spot again.`
        );
        this.isCancel = false;
        this.closeMessage = `Your in the waitlist for ${this.storeName} has been over. Please reserve spot again.`;
        this.isList = true;
        this.router.navigateByUrl(`waitlist/${this.locationData.checkInUrl}`);
        // this.cancelPageRefresh();
        // if (this.secondRefresher) {
        //   clearInterval(this.secondRefresher);
        // }
      }
      // }, 1000);
    });
  }

  newSpot() {
    this.subscription.unsubscribe();
    this.publicService.reReserveBooking(this.bookingId).subscribe(
      (result) => {
        this.notificationService.success(
          "Your new spot has been created successfully."
        );
        this.router.navigateByUrl(
          `waitlist/${result.booking.id}/${this.locationQrId}`
        );
        this.helperService.reserveSpot(true);
      },
      (error) => {
        this.notificationService.warning("Please try again.");
      }
    );
  }

  cancelSpot() {
    this.publicService.cancelBooking(this.bookingId).subscribe(
      (result) => {
        this.notificationService.success(
          "Your spot has been cancelled successfully."
        );
        this.isCancel = true;
        this.closeMessage = `Your in the waitlist for ${this.storeName} has been cancelled successfully`;
        this.isList = true;
        this.router.navigateByUrl(`waitlist/${this.locationData.checkInUrl}`);
        this.helperService.reserveSpot(true);
      },
      (error) => {
        this.notificationService.warning("Please try again.");
      }
    );
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.isCancel = false;
    // clearInterval(this.timer);
    this.subscription?.unsubscribe();
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
