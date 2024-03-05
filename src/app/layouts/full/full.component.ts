import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { MediaMatcher } from "@angular/cdk/layout";
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  AfterViewInit,
  OnInit,
} from "@angular/core";
import { MenuItems } from "../../shared/menu-items/menu-items";
import { ActivatedRoute, Router } from "@angular/router";
import { UserAuthService } from "@app-core";
import { TranslateService } from "@ngx-translate/core";
import { TranslateModule } from "@ngx-translate/core";

declare var $: any;
enum Tabs {
  Profile,
  Account,
  Pricing,
}

@NgModule({
  imports: [TranslateModule],

  exports: [TranslateModule],
  providers: [],
})
@Component({
  selector: "app-full-layout",
  templateUrl: "full.component.html",
  styleUrls: ["./full.component.scss"],
})
export class FullComponent implements OnInit, AfterViewInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  tabs = Tabs;
  currentTab: number = Tabs.Profile;
  isSuperAdmin: boolean = false;
  isBusinessOwner: boolean = false;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userAuthService: UserAuthService,
    public translate: TranslateService
  ) {
    this.mobileQuery = media.matchMedia("(min-width: 768px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.isSuperAdmin = this.userAuthService.isSuperAdmin();
    this.isBusinessOwner = this.userAuthService.isBusinessAdmin();
  }

  tabClick(tab: number) {
    this.currentTab = tab;

    switch (this.currentTab) {
      case this.tabs.Profile:
        this.router.navigateByUrl(`secure/profile`);
        break;
      case this.tabs.Account:
        this.router.navigateByUrl(`secure/account`);
        break;
      case this.tabs.Pricing:
        this.router.navigateByUrl(`secure/pricing`);
        break;
    }
  }

  getCurrentTab() {
    let url: string = this.router.url;

    if (url.split("/").some((t) => t.toLowerCase() === "profile")) {
      return this.tabs.Profile;
    } else if (url.split("/").some((t) => t.toLowerCase() === "account")) {
      return this.tabs.Account;
    } else if (url.split("/").some((t) => t.toLowerCase() === "pricing")) {
      return this.tabs.Pricing;
    } else {
      return undefined;
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
