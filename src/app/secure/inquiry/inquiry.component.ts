import { Component, OnInit } from "@angular/core";
import { Inquiry } from "src/app/model/inquiry";
import { AccountService } from "../account/account.service";
@Component({
  selector: "app-inquiry",
  templateUrl: "./inquiry.component.html",
  styleUrls: ["./inquiry.component.css"],
})
export class InquiryComponent implements OnInit {
  inquiryData: Array<Inquiry>;
  page = 1;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.getInquiries();
  }
  getInquiries() {
    this.accountService.getInquiries().subscribe((data) => {
      if (data) {
        this.inquiryData = data;
      }
    });
  }
  pageChanged(event) {
    this.page = event;
  }
}
