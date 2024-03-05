import { Component, OnInit } from "@angular/core";
import { PublicService } from "../public.service";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { SpotData, FeedbackData } from "@app-models";
import { APIConstant, CommonUtility } from "@app-core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { MatOptionSelectionChange } from "@angular/material";

@Component({
  templateUrl: "./feedback.component.html",
  styleUrls: ["./feedback.component.scss"],
})
export class FeedbackComponent implements OnInit {
  frmFeedback: FormGroup;
  isFormSubmitted: boolean;
  bookingId: number;
  bookingData: SpotData;
  feedbackData: FeedbackData[];
  selectedFeedbackData: FeedbackData[] = [];
  feedbackIds: Array<number> = [];
  userName: string;
  isLoaded: boolean = false;
  isSaved: boolean = false;
  isSelected: boolean = false;
  isFeedbackSubmitted: boolean = false;

  theme: string;
  branding: boolean = true;

  email: boolean = false;
  zoom = 18;
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
  storeName: string;
  user: any;
  loggedIn: boolean;
  companyLogo: string = null;
  isButtonDisabled: boolean = false;
  basePath: string = APIConstant.basePath + "api/";
  selectedValue: number;

  private routerSub: Subscription;
  error: any;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private notificationService: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.routerSub = this.activatedRoute.params.subscribe(({ id }) => {
      if (CommonUtility.isNotEmpty(id)) {
        this.bookingId = id;
        this.getBookingDetails();
      }
    });
  }

  private createForm() {
    this.frmFeedback = this.fb.group({
      feedback: [[], [Validators.required]],
      comment: [""],
    });
  }

  getBookingDetails() {
    this.publicService.bookingData(this.bookingId).subscribe(
      (result: SpotData) => {
        this.isLoaded = true;
        this.bookingData = result;
        this.locationId = this.bookingData.locationId;
        this.GetLocationData();
        this.getFeedbacks();
        this.frmFeedback.get("comment").disable();
        if (this.bookingData.feedback.length > 0) {
          this.isSaved = true;
        }
      },
      (error) => {}
    );
  }

  getFeedbacks() {
    this.publicService.getfeedbackListByLocation(this.locationId).subscribe(
      (result: FeedbackData[]) => {
        this.isLoaded = true;
        this.feedbackData = result;

        if (CommonUtility.isNotEmpty(this.bookingData.feedback)) {
          this.isFeedbackSubmitted = true;
          this.feedbackData.forEach((feedback) => {
            if (
              this.bookingData.feedback.some(
                (selected) => feedback.id === selected.id
              )
            ) {
              if (
                this.selectedFeedbackData.some(
                  (selected) => feedback.id === selected.id
                ) === false
              ) {
                this.feedbackIds.push(feedback.id);
                this.selectedFeedbackData.push(feedback);
              }
            }
          });

          this.isSelected = true;

          this.selectedValue = this.bookingData.rating;
          this.frmFeedback.controls.feedback.setValue(
            this.bookingData.feedback
          );
          this.frmFeedback.controls.comment.setValue(this.bookingData.comment);
          this.frmFeedback.controls.comment.disable();
        }
      },
      (error) => {}
    );
  }

  save() {
    this.isFormSubmitted = true;

    if (!this.frmFeedback.valid) {
      return;
    }

    this.error = null;

    this.publicService
      .addfeedback(this.bookingId, {
        rating: this.selectedValue,
        feedbackIds: this.feedbackIds,
      })
      .subscribe(
        (result) => {
          this.isSaved = true;
          this.notificationService.success(
            "Thank you for your valuable feedback!!"
          );
        },
        (error) => {
          if ((error && error.status === 400) || error.status === 404) {
            this.error = error.error ? error.error || null : null;
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

  countStar(rate: number) {
    if (!this.isSaved) {
      this.selectedValue = rate;
    }
  }

  addFeedback(event: MatOptionSelectionChange) {
    if (event.source.selected) {
      if (!this.feedbackIds.includes(event.source.value)) {
        this.feedbackData.find((item) => item.id === event.source.value)
          .points++;
        var selected = this.feedbackData.find(
          (item) => item.id === event.source.value
        );
        if (
          this.selectedFeedbackData.some(
            (feedback) => feedback.id === selected.id
          ) === false
        ) {
          this.feedbackIds.push(selected.id);
          this.selectedFeedbackData.push(selected);
        }
        this.isSelected = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  private GetLocationData() {
    this.publicService.locationData(this.locationId).subscribe((result) => {
      this.locationId = result.id;
      this.theme = result.theme;
      this.branding = result.branding;

      if (result.businessAdmin.profilepic !== null) {
        this.companyLogo =
          this.basePath +
          "admin/files/profilepic/" +
          result.businessAdmin.profilepic;
      } else {
        this.companyLogo = null;
      }
      this.lat = Number(result.latitude);
      this.lng = Number(result.longitude);

      this.storeName = result.businessAdmin.companyName;
      navigator.geolocation.getCurrentPosition((x) => {
        this.center = {
          lat: x.coords.latitude,
          lng: x.coords.longitude,
        };

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
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
          provideRouteAlternatives: true,
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

  removeFeedback(removedId: number) {
    if (this.feedbackIds.includes(removedId)) {
      this.feedbackData.find((item) => item.id === removedId).points--;
      this.feedbackIds = this.feedbackIds.filter((id) => id !== removedId);
      this.selectedFeedbackData = this.selectedFeedbackData.filter(
        (feedback) => feedback.id !== removedId
      );
      if (this.feedbackIds.length < 1 && this.selectedFeedbackData.length < 1) {
        this.isSelected = false;
      }
    }
  }
}
