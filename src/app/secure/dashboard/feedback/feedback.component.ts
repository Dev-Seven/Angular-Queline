import { Component, OnInit, Renderer2 } from "@angular/core";
import { FeedbackData } from "@app-models";
import { Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { PublicService } from "src/app/public/public.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DashboardService } from "../dashboard.service";
import { ToastrService } from "ngx-toastr";
import { UserAuthService } from "@app-core";

@Component({
  selector: "feedback",
  templateUrl: "./feedback.component.html",
  styleUrls: ["./feedback.component.scss"],
})
export class FeedbackComponent implements OnInit {
  frmFeedback: FormGroup;
  isFormSubmitted: boolean = false;
  booking;
  feedback: FeedbackData[];
  locationId;
  rating: number = 0;
  public onClose: Subject<{}>;
  error: any;
  constructor(
    private renderer: Renderer2,
    public bsModalRef: BsModalRef,
    private dashboardService: DashboardService,
    private notificationService: ToastrService,
    private userAuthService: UserAuthService,
    private publicService: PublicService,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.onClose = new Subject();
    this.frmFeedback.get("comment").setValue(this.booking.comment);
    if (!this.userAuthService.isBusinessAdmin()) {
      this.frmFeedback.get("comment").disable();
    }

    this.publicService
      .getfeedbackListByLocation(this.booking.locationId)
      .subscribe(
        (result: FeedbackData[]) => {
          this.booking.feedback.forEach((feed) => {
            feed.points = result.find((item) => item.id === feed.id).points;
          });
        },
        (error) => {}
      );
  }

  createForm() {
    this.frmFeedback = this.fb.group({
      comment: [null, [Validators.maxLength(50)]],
    });
  }

  save() {
    this.isFormSubmitted = true;

    if (!this.frmFeedback.valid) {
      return;
    }

    this.dashboardService
      .updateComment(this.booking.id, this.frmFeedback.value)
      .subscribe((result) => {
        this.notificationService.success("Your comment has beed added!!");

        this.close();
      });
  }

  close() {
    this.onClose.next;
    this.bsModalRef.hide();
  }
}
