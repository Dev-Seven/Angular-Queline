import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'party-size-modal',
    templateUrl: 'party-size-modal.component.html',
    styleUrls: ['./party-size-modal.component.scss']
})

export class PartySizeModalComponent implements OnInit {

    partySize: number;
    frmPartySize: FormGroup;
    isFormSubmitted: boolean;

    public onClose: Subject<{ partySize: number }>;

    constructor(public bsModalRef: BsModalRef, private fb: FormBuilder) {
        this.createForm();
    }

    ngOnInit() {
        this.onClose = new Subject();
        this.setFormData();
    }

    private createForm() {
        this.frmPartySize = this.fb.group({
            partySize: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
        });
    }

    private setFormData() {
        this.frmPartySize.controls.partySize.setValue(this.partySize);
    }

    updatePartySize() {
        this.isFormSubmitted = true;

        if (this.frmPartySize.invalid) {
            return;
        }

        this.partySize = this.frmPartySize.controls.partySize.value;
        this.onClose.next({ partySize: this.partySize });
        this.bsModalRef.hide();
    }
}