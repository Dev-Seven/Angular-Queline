import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  templateUrl: "./unauthorized.component.html",
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  signin() {
    this.router.navigateByUrl("/login");
  }
}
