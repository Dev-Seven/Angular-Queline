import { Component } from "@angular/core";
import { ContactusService } from "../contactus/contactus.service";
import { ToastrService } from "ngx-toastr";

@Component({
  templateUrl: "./contactus.component.html",
  styleUrls: ["./contactus.component.scss"],
})
export class ContactusComponent {
  constructor(
    private contactusService: ContactusService,
    private notificationService: ToastrService
  ) {}

  contactusdetails(value) {
    this.contactusService.saveInquiry(value).subscribe((result) => {
      this.notificationService.success("Your inquiry has beed submitted!!");
    });
  }
}
