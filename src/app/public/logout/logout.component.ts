import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserAuthService } from "@app-core";

@Component({
  selector: "logout",
  templateUrl: "./logout.component.html",
})
export class LogoutComponent implements OnInit {
  constructor(
    private router: Router,
    private userAuthService: UserAuthService
  ) {}

  ngOnInit() {
    this.logout();
  }

  logout() {
    localStorage.clear();
    this.userAuthService.loggedOut();

    setTimeout(() => {
      this.router.navigate(["login"]);
    });
  }
}
