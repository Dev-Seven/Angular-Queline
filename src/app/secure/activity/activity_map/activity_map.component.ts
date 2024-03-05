import { Component, OnInit } from "@angular/core";
import { Activity } from "@app-models";

import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: "activityMap",
  templateUrl: "./activity_map.component.html",
  styleUrls: ["./activity_map.component.scss"],
})
export class ActivityMapComponent implements OnInit {
  activityData: Activity;
  isLoaded: boolean = false;
  public onClose: Subject<{}>;

  directionsService: google.maps.DirectionsService;
  directionsRenderer: google.maps.DirectionsRenderer;
  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {
    this.onClose = new Subject();

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();

    const map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        zoom: 6,
        center: {
          lat: Number(this.activityData.userLatitude),
          lng: Number(this.activityData.userLongitude),
        },
      }
    );

    const request = {
      origin: {
        lat: Number(this.activityData.userLatitude),
        lng: Number(this.activityData.userLongitude),
      },
      destination: {
        lat: Number(this.activityData.locationLatitude),
        lng: Number(this.activityData.locationLongitude),
      },
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    };

    this.directionsService.route(request, (response, status) => {
      this.isLoaded = true;
      if (status === "OK") {
        this.directionsRenderer.setMap(map);
        this.directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    });
  }

  close() {
    this.onClose.next(false);
    this.bsModalRef.hide();
  }
}
