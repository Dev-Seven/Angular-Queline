import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { PublicService } from "../public.service";
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from "@angular/forms";
import { ValidationService } from "@app-shared";
import {
  EndUser,
  BookingUser,
  Location,
  LocationInput,
  UserInput,
  Booking,
} from "@app-models";
import { CommonUtility, APIConstant } from "@app-core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import {
  GoogleLoginProvider,
  SocialAuthService,
  FacebookLoginProvider,
} from "angularx-social-login";
import { ApiService } from "../services/api/api.service";
import { MessagingService } from "../../service/messaging.service";
import { HelperService } from "../services/helper/helper.service";
import { EncrDecrServiceService } from "src/app/service/encr-decr-service.service";
import { environment } from "src/environments/environment";

@Component({
  templateUrl: "./select-mode.component.html",
  styleUrls: ["./select-mode.component.css"],
})
export class SelectModeComponent implements OnInit {
  frmSignup: FormGroup;
  isSignUpFormSubmitted: boolean;
  privacyPolicyCheck: boolean = false;

  frmReserve: FormGroup;
  isReserveFormSubmitted: boolean;
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
  private locationUnqId: string;
  locationId: number;
  private routerSub: Subscription;
  storeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  user: any;

  loggedIn: boolean;
  companyLogo: string = null;
  isLoaded: boolean = false;
  storeBooking: boolean;

  basePath: string = APIConstant.basePath + "api/";
  locationData: Location;
  maxPartySize: number;
  partySize: number = 1;
  theme: string;
  color: string;
  branding: boolean = true;

  customeBookingInput: boolean = false;
  customeUserInput: boolean = false;
  customBookingLocationInputs: LocationInput[];
  customUserLocationInputs: LocationInput[];
  endUserSignUp: boolean = false;
  frmReserveInput = [];
  frmSignUpInput = [];
  userId: number;
  userInputDetails: UserInput[];
  message;

  constructor(
    private publicService: PublicService,
    private router: Router,
    private ref: ChangeDetectorRef,
    // private encrDecrService: EncrDecrServiceService,
    private authService: SocialAuthService,
    private activatedRoute: ActivatedRoute,
    private messagingService: MessagingService
  ) {}

  ngOnInit(): void {
    this.messagingService.requestPermission();
    this.messagingService.receiveMessage();
    this.message = this.messagingService.currentMessage;

    this.routerSub = this.activatedRoute.params.subscribe(
      ({ locationId, partySize, userId }) => {
        // console.log(
        //   "Decrypted",
        //   this.encrDecrService.get(environment.encryptKey, locationId)
        // );
        // locationId = this.encrDecrService.get(
        //   environment.encryptKey,
        //   locationId
        // );

        if (CommonUtility.isNotEmpty(locationId)) {
          this.locationUnqId = locationId;
          this.GetLocationData();
        }
      }
    );
  }

  selectMode(mode: string) {
    if (mode == "Booking") {
      this.router.navigateByUrl(`booking/${this.locationUnqId}`);
      // this.router.navigateByUrl(
      //   `booking/${this.encrDecrService.set(
      //     environment.encryptKey,
      //     this.locationUnqId
      //   )}`
      // );
    } else if (mode == "Waitlist") {
      this.router.navigateByUrl(`reservespot/${this.locationUnqId}`);
      // this.router.navigateByUrl(
      //   `reservespot/${this.encrDecrService.set(
      //     environment.encryptKey,
      //     this.locationUnqId
      //   )}`
      // );
    }
  }

  private GetLocationData() {
    this.publicService
      .locationDataByQr(this.locationUnqId)
      .subscribe((result) => {
        this.storeBooking = result.storeBooking;
        this.locationId = result.id;
        this.locationData = result;
        this.maxPartySize = this.locationData.partySize;
        this.theme = this.locationData.theme;
        this.theme = this.locationData.theme;
        this.branding = this.locationData.branding;
        this.address = result.address;
        this.city = result.city;
        this.state = result.state;
        this.zipCode = result.zipCode;
        this.country = result.country;
        this.lat = Number(result.latitude);
        this.lng = Number(result.longitude);
        this.ref.detectChanges();

        if (result.businessAdmin.privacyPolicy === null) {
          this.privacyPolicyCheck = true;
        } else {
          this.isLoaded = true;
        }
        if (result.image !== null) {
          this.companyLogo =
            this.basePath + "location/files/image/" + result.image;
        } else {
          this.companyLogo = null;
        }
        this.storeName = result.businessAdmin.companyName;

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

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    if (this.user != null) {
      this.authService.signOut();
    }
    this.user = null;
    this.loggedIn = false;
  }
}
