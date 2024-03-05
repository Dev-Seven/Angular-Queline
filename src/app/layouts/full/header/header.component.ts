import { Component, OnInit } from "@angular/core";
import { UserAuthService, APIConstant, CommonUtility } from "@app-core";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "@app-models";
import { TranslateService } from "@ngx-translate/core";

enum Tabs {
  Profile,
  Account,
  Pricing,
}
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: [],
})
export class AppHeaderComponent implements OnInit {
  user: User;
  basePath: string = APIConstant.basePath + "api/";
  tabs = Tabs;
  currentTab: number = Tabs.Profile;
  isSuperAdmin: boolean = false;
  isBusinessOwner: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userAuthService: UserAuthService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.user = this.userAuthService.getUser();
  }

  getProfilePic(): string {
    let profilePic: string = "";
    let user: User = this.userAuthService.getUser();

    if (
      CommonUtility.isNotEmpty(user) &&
      CommonUtility.isNotEmpty(user.profilepic)
    ) {
      profilePic = this.basePath + "admin/files/profilepic/" + user.profilepic;
    } else {
      profilePic = "assets/images/background/user-info.jpg";
    }

    return profilePic;
  }

  goToMyProfile() {
    if (this.user) {
      this.router.navigateByUrl(`secure/profile/edit/${this.user.id}`);
    }
  }
  goToMyAccount() {
    if (this.user) {
      this.router.navigateByUrl(`secure/account`);
    }
  }
  goToMyPrice() {
    if (this.user) {
      this.router.navigateByUrl(`secure/pricing`);
    }
  }
  signOut() {
    this.userAuthService.loggedOut();

    setTimeout(() => {
      this.router.navigate(["login"]);
    });
  }

  changeLang(language: string) {
    localStorage.setItem("locale", language);
    this.translate.use(language);
  }
}
