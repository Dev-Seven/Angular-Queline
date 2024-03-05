import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationService } from './validation-service';

@Component({
    selector: 'validation-message',
    template: `<div class="error-text" *ngIf="errorMessage !== null">{{errorMessage}}</div>`,
    styles: [`
        .error-text{
            font-size: 11px;
            margin-top:-1.5em;
        }
    `],
})
export class ValidationMessage {

    @Input("control")
    control: FormControl;

    @Input("message")
    message: string;

    @Input("formSubmitted")
    formSubmitted: boolean;


    constructor() { }

    get errorMessage() {
        for (let propertyName in this.control.errors) {
            if (this.control.errors.hasOwnProperty(propertyName) && (this.control.touched || this.formSubmitted)) {
                return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName], this.message);
            }
        }
        return null;
    }
}