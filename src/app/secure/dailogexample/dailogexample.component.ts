import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";

import { Subject, Subscription } from "rxjs";

@Component({
  templateUrl: "./dailogexample.component.html",
  styleUrls: ["./dailogexample.component.scss"],
})
export class DailogexampleComponent implements OnInit {
  locationId: number = 0;

  public onClose: Subject<{ isCancel: boolean }>;
  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit(): void {
    this.onClose = new Subject();
  }

  close() {
      
    this.bsModalRef.hide();
    this.onClose.next({ isCancel: true });
  }
}
