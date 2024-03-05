import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";

@Component({
    selector: 'term-condition-modal',
    templateUrl: 'term-condition-modal.component.html',
    styleUrls: ['./term-condition-modal.component.scss']
})

export class TermConditionModalComponent implements OnInit {

    public onClose: Subject<{}>;

    constructor(public bsModalRef: BsModalRef) {

    }

    ngOnInit() {
        this.onClose = new Subject();
    }

    ok() {
        this.onClose.next({});
        this.bsModalRef.hide();
    }
}