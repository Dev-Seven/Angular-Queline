import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'search-number',
    template: `<input  class="form-control m-input" type="number" 
    [formControl]="searchBox" [placeholder]="placeHolder">`,
    styles: []
})
export class SearchNumberComponent implements OnInit {

    searchBox: FormControl = new FormControl();;

    @Input() placeHolder = "Search";
    @Output() textSearchEntered = new EventEmitter();

    ngOnInit() {
        this.searchBox.valueChanges.pipe(debounceTime(300))
            .subscribe(value => this.textSearchEntered.emit(value));
    }
}