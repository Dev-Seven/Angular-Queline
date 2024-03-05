import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'search-inactive',
    template: ` <div class="m-checkbox-inline">
            <label class="m-checkbox">
                <input type="checkbox" [formControl]="searchBox" (change)="checkboxChanged($event.currentTarget.checked)"> {{placeHolder}}
                <span></span>
            </label>
        </div>`,
    styles: []
})

export class SearchInActiveComponent {
    searchBox: FormControl = new FormControl(false);

    @Input() placeHolder = "Show Deleted";
    @Output() chkChanged = new EventEmitter();

    checkboxChanged(isChecked) {
        this.chkChanged.emit(isChecked ? true : false);
    }
}