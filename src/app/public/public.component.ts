import { Component } from "@angular/core";
import * as firebase from "firebase";
import { environment } from "src/environments/environment";
const config = {
  apiKey: environment.firebase.apiKey,
  databaseURL: environment.firebase.databaseURL,
};
@Component({
  selector: "public-root",
  templateUrl: "./public.component.html",
})
export class PublicComponent {
  constructor() {}
}
