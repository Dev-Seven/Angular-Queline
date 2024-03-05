//import { VerifyLink } from '../../model/user';
import { NgModule, OnInit } from "@angular/core";
import { VerifyLink } from "@app-models";
import { PublicService } from "../public.service";
import { Router } from "@angular/router";

import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

@NgModule({
  imports: [TranslateModule],
  exports: [TranslateModule],
  providers: [],
})
export class VerifyComponent implements OnInit {
  activationkey: String;

  constructor(
    private publicService: PublicService,
    private router: Router,
    public translate: TranslateService,
    private notificationService: ToastrService
  ) {}

  ngOnInit() {
    this.verify();
  }

  verify() {
    const admin: VerifyLink = new VerifyLink();
    this.activationkey = admin.activateKey;

    this.publicService.verify(admin).subscribe(
      (result) => {
        this.notificationService.success("Signup has been done successfully!!");
        this.router.navigateByUrl(`login`);
      },
      (error) => {}
    );

    return false;
  }
}
