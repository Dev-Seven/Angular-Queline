import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'search-text',
    template: `<div class="input-group input-group-merge input-group-flush">
                        <div class="input-group-prepend">
                          <div class="input-group-text">
                            <i class="tio-search"></i>
                          </div>
                        </div>
                        <input id="searchInput" [formControl]="searchBox" [placeholder]="placeHolder" type="search" class="form-control">
                      </div>
                `,
    styles: []
})
export class SearchTextComponent implements OnInit {

    searchBox: FormControl = new FormControl();;

    @Input() placeHolder = "Search";
    @Output() textSearchEntered = new EventEmitter();

    ngOnInit() {
        this.searchBox.valueChanges.pipe(debounceTime(300))
            .subscribe(value => this.textSearchEntered.emit(value));
    }
}