import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UserAuthService,
  CommonUtility,
  NotificationService,
  APIConstant,
} from "@app-core";
import { Router } from "@angular/router";
import { AccountService } from "../account/account.service";
import { jsPDF } from "jspdf";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StripeService, StripeCardComponent } from "ngx-stripe";
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { ValidationService } from "@app-shared";
import { DatePipe } from "@angular/common";

@Component({
  templateUrl: "./pricing.component.html",
  styleUrls: ["./pricing.component.scss"],
})
export class PricingComponent implements OnInit {
  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  isBusinessOwner: boolean = false;
  companyId: number;
  clickedPlan:number;
  currentPlan : string ='';
  planDetails = {
    plan: 0,
    spots: 0,
    total_spots: 0,
    sms: 0,
    total_sms: 0,
    expiry_date: 0,
  };

  smsDetails = { total_sms: 0, sms: 0, type: "" };
  usedSpots = 0;
  unusedSpots = 0;
  addSpotModel = false;
  isButtonShow : boolean = false;
  orders: any;
  page: number = 1;
  isYearlyPlan = false;
  isFormSubmitted = false;
  datePipe = new DatePipe("en-US");
  dataRefresher: NodeJS.Timeout;
  adminEmail: string;
  usedSms: number;
  unusedSms: number;
  addSmsModel = false;
  constructor(
    private router: Router,
    private userAuthService: UserAuthService,
    private accountService: AccountService,
    private fb: FormBuilder,
    private stripeService: StripeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.stripeTest = this.fb.group({
      email: ["", [Validators.required, ValidationService.emailValidator]],
    });
    this.companyId = this.userAuthService.getUser().id;
    this.adminEmail = this.userAuthService.getUser().email;
    this.getPlanDetails();
    this.getOrderList();   
    
    const admin = JSON.parse(localStorage.getItem('que-user'));

    if(admin.twilioKey == null && admin.twilioToken == null ){
      this.isButtonShow = true
    }
  
  }

  saveInvoice(id) {
    this.accountService.getOrder(id).subscribe((result) => {
      let orederData = result.data;

      var pdf = new jsPDF("portrait", "pt", "a4");

      pdf.html(
        `<div style="padding-left:10px;padding-right:10px;display:block;width:100%;"><table width="580px" border="0" cellspacing="0" cellpadding="10px"><tbody><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="0" padding="0px" style="margin-top:30px;"><tr><td style="vertical-align: top;"> <img class="navbar-brand-logo" src="../../../assets/svg/logos/logo.png" width="100px" alt="Queline"></td><td>&nbsp;	</td><td style="vertical-align: top;" align="right"><h2 style="margin:0 0 10px 0; display: inline-block;width: 100%;">Invoice</h2><p style="display: inline-block;width: 100%;margin: 0 0 10px 0; padding: 0;">#${
          orederData.order_id
        }</p><p style="display: inline-block;width: 100%;margin: 0 0 10px 0; padding: 0;line-height: 23px;">QueLine APP inc.,<br>280 Rue Saint-jacques,<br>Montreal, QC h3c0g1,<br>Canada, 5149988827</p></tr></table></td></tr><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="vertical-align: top;text-align:right;" align="right"> <h4 style="margin:0 0 10px 0; display: inline-block;width: 100%;text-align:left;color:#000;">Bill to:</h4><h4 style="margin:0 0 10px 0; display: inline-block;width: 100%;text-align:left;">${
          orederData.company_name
        }</h4><p style="display: inline-block;width: 100%;margin: 0 0 10px 0; padding: 0;line-height: 23px;text-align:left;">${
          orederData.address ? orederData.address : ""
        }</p></td><td style="width:300px;">&nbsp;</td><td style="vertical-align: top;ext-align:right;" align="right"> <p style="margin:0 0 10px 0; display: inline-block;width: 100%;padding: 0;color:#000;">Invoice date:</p><p style="display: inline-block;width: 100%;margin: 0 0 10px 0; padding: 0;">${this.datePipe.transform(
          orederData.order_date,
          "dd/MM/yyyy"
        )}</p><p style="margin:0 0 10px 0; display: inline-block;width: 100%;padding: 0;color:#000;">Due date:</p><p style="display: inline-block;width: 100%;margin: 0 0 10px 0; padding: 0;">${this.datePipe.transform(
          orederData.due_date,
          "dd/MM/yyyy"
        )}</p></td></tr></table></td></tr><tr><td><table style="width:100%;"><thead><tr><th style="color: #677788;background-color: #f8fafd;border-top:1px solid #fbf5ea;border-bottom:1px solid #fbf5ea;padding:10px;">Item</th><th style="color: #677788;background-color: #f8fafd;border-top:1px solid #fbf5ea;border-bottom:1px solid #fbf5ea;padding:10px;">Quantity</th><th style="color: #677788;background-color: #f8fafd;border-top:1px solid #fbf5ea;border-bottom:1px solid #fbf5ea;padding:10px;">Rate</th><th  style="color: #677788;background-color: #f8fafd;border-top:1px solid #fbf5ea;border-bottom:1px solid #fbf5ea;padding:10px;text-align: right;">Amount</th></tr></thead><tbody><tr><td style="color: #677788;padding:10px;">${
          orederData.plan_name
        }</td><td style="color: #677788;padding:10px;">${
          orederData.qty
        }</td><td style="color: #677788;padding:10px;">$${
          orederData.rate
        }</td><td style="color: #677788;padding:10px;text-align: right;">$${
          orederData.amount
        }</td></tr></tbody></table></td></tr><tr><td><table width="100%" border="0" cellspacing="0" cellpadding="10px" style="border-top:1px solid #fbf5ea;"><tr><td style="width:400px;">&nbsp;</td>  <td style="text-align: right;color:#000;"> Total:</td> <td style="text-align: right;">$${
          orederData.total
        }</td></tr><tr><td style="width:400px;">&nbsp;</td> <td style="text-align: right;color:#000;">Tax:</td> <td style="text-align: right;">$${
          orederData.tax
        }</td></tr><tr><td style="width:400px;">&nbsp;</td> <td style="text-align: right;color:#000;">Amount paid:</td> <td style="text-align: right;">$${
          orederData.amount_paid
        }</td></tr></table></td></tr><tr><td>&nbsp;</td></tr></tbody></table></div>`,
        {
          callback: function (pdf) {
            pdf.save(`${orederData.company_name}-${orederData.order_date}.pdf`);
          },
        }
      );
    });
  }

  getPlanDetails() {
    const businessDetails = this.accountService
      .getBusinessSports({ business_id: this.companyId })
      .subscribe((result) => {
        this.planDetails = result;      

        this.usedSpots =
          (100 * (this.planDetails.total_spots - this.planDetails.spots)) /
          this.planDetails.total_spots;
        this.unusedSpots =
          (100 * this.planDetails.total_spots) / this.planDetails.total_spots;

        // console.log(this.usedSpots, this.unusedSpots);

        if (this.planDetails.plan == 1) {
          this.currentPlan = "Basic";
        } else if (this.planDetails.plan == 2) {
          this.currentPlan = "Starter";
        } else if (this.planDetails.plan == 10) {    
          this.currentPlan = "Business";
        } else if (this.planDetails.plan == 9) {
          this.currentPlan = "Life Time";
          this.usedSms =
            (100 * (this.planDetails.total_sms - this.planDetails.sms)) /
            this.planDetails.total_sms;
          this.unusedSms =
            (100 * this.planDetails.total_sms) / this.planDetails.total_sms;
        } else {
          this.currentPlan = "Enterprice";
        }

        if (this.planDetails.plan > 3 && this.planDetails.plan < 9)
          this.accountService
            .getSMScount(this.adminEmail)
            .subscribe((result) => {
              this.smsDetails.sms = result.user.sms;
              this.smsDetails.total_sms = result.user.totalSms;
              this.smsDetails.type = result.user.type;

              this.usedSms =
                (100 * (this.smsDetails.total_sms - this.smsDetails.sms)) /
                this.smsDetails.total_sms;

              this.unusedSms =
                (100 * this.smsDetails.total_sms) / this.smsDetails.total_sms;
            });
      });

    this.dataRefresher = setInterval(() => {
      this.getOrderList();
    }, 15000);
  }

  contactus() {
    this.router.navigateByUrl("secure/contactus");
  }

  cardOptions: StripeCardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        iconColor: "#666EE8",
        color: "#31325F",
        fontWeight: "300",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: "18px",
        "::placeholder": {
          color: "#CFD7E0",
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: "en",
  };

  stripeTest: FormGroup;

  selectPlan(plan : number):void{
    this.clickedPlan = plan;
  }

  //Subscribe to new plan
  createToken(): void {
    this.isFormSubmitted = true;
    if (this.addSpotModel) {
      this.addSpots();
    } else if (this.addSmsModel) {
      this.addSms();
    } else {
      const name = this.stripeTest.get("email").value;

      this.stripeService
        .createPaymentMethod({
          type: "card",
          card: this.card.element,
          billing_details: {
            email: name,
          },
        })
        .subscribe((result) => {
          this.accountService
            .upgradeBusinessPlan({
              id: this.companyId,
              plan : this.clickedPlan,
              payment_method: result.paymentMethod.id,
              email: name,
              isYearlyPlan: this.isYearlyPlan,
            })
            .subscribe((result) => {
              if (result.status) {
                document.getElementById("stripeCloseButton").click();
                this.notificationService.success(
                  "Subscription added successfully"
                );
                this.getPlanDetails();
              } else {
                this.notificationService.error("Something went wrong");
              }
            });
        });
    }
  }
  //Cancle Subscription
  downgradePlan() {
    this.accountService
      .downgradeBusinessPlan(this.companyId)
      .subscribe((result) => {
        if (result.status) {
          this.notificationService.success(
            "Subscription cancelled successfully"
          );
          this.getPlanDetails();
        } else {
          this.notificationService.error("Something went wrong");
        }
      });
  }
  changeSmsModel() {
    this.addSmsModel = true;
  }
  changeModel() {
    this.addSpotModel = true;
  }
  //Add new spots to current plan
  addSpots() {
    this.addSpotModel = false;
    const name = this.stripeTest.get("email").value;
    this.stripeService
      .createToken(this.card.element, { name })
      .subscribe((result) => {
        if (result.token) {
          // Use the token

          this.accountService
            .addSpots({
              id: this.companyId,
              payment_method: result.token.id,
              email: name,
            })
            .subscribe((result) => {
              if (result.status) {
                document.getElementById("stripeCloseButton").click();
                this.notificationService.success(
                  "1000 Spots are added successfully"
                );
                this.getPlanDetails();
              } else {
                this.notificationService.error("Something went wrong");
              }
            });
        } else if (result.error) {
        }
      });
  }
  addSms() {
    this.addSmsModel = false;
    const name = this.stripeTest.get("email").value;
    this.stripeService
      .createToken(this.card.element, { name })
      .subscribe((result) => {
        if (result.token) {
          // Use the token

          this.accountService
            .addSms({
              id: this.companyId,
              payment_method: result.token.id,
              email: name,
            })
            .subscribe((result) => {
              if (result.status) {
                document.getElementById("stripeCloseButton").click();
                this.notificationService.success(
                  "600 SMS are added successfully"
                );
                this.getPlanDetails();
              } else {
                this.notificationService.error("Something went wrong");
              }
            });
        } else if (result.error) {
        }
      });
  }
  getOrderList() {
    this.accountService.getOrderList(this.companyId).subscribe((result) => {
      this.orders = result;
    });
  }
  //Change plan
  onCheckboxChange(e) {
    if (e.target.checked) {
      this.isYearlyPlan = true;
    } else {
      this.isYearlyPlan = false;
    }
  }
  pageChanged(event) {
    this.page = event;
  }
}
