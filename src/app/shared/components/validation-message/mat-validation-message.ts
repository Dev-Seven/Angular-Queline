import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationService } from './validation-service';
import { matFormFieldAnimations } from '@angular/material/form-field';

@Component({
    selector: 'mat-validation-message',
    template: `
    <div class="error-wrapper" *ngIf="errorMessage !== null">
        <div [@transitionMessages]="errorMessage !== null ? 'enter' : ''">
            <div class="error" role="alert" style="">{{errorMessage}}</div>
        </div>
    </div>
    `,
    styles: [`
    `],
    animations: [matFormFieldAnimations.transitionMessages]
})
export class MatValidationMessage {


    @Input("control")
    control: FormControl;

    @Input("message")
    message: string;

    @Input("formSubmitted")
    formSubmitted: boolean;


    constructor() { }

    get errorMessage() {
        if(this.control.errors != null){
            for (let propertyName in this.control.errors) {
                if (this.control.errors.hasOwnProperty(propertyName) && (this.control.touched || this.formSubmitted)) {
                    return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName], this.message);
                }
            }
        }
        return null;
    }
}