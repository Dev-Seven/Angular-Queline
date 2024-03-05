import { Component, OnInit } from "@angular/core";
import { CommonService } from "./common.service";
import { TranslateService } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
declare var $: any;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  constructor(
    private commonService: CommonService,
    public translate: TranslateService,
    private http: HttpClient
  ) {
    translate.addLangs(["English", "French", "Spanish", "Italy"]);
    if (localStorage.getItem("locale")) {
      const browserLang = localStorage.getItem("locale");
      translate.use(
        browserLang.match(/English|French|Spanish|Italy/)
          ? browserLang
          : "English"
      );
    } else {
      localStorage.setItem("locale", "English");
      translate.setDefaultLang("English");
    }
  }
  ngOnInit() {
    this.commonService.loadAllScripts();
  }
  changeLang(language: string) {
    localStorage.setItem("locale", language);
    this.translate.use(language);
  }
}
