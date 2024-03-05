import { NgModule } from '@angular/core';
import { MenuItems } from './menu-items/menu-items';
import { AccordionAnchorDirective, AccordionLinkDirective, AccordionDirective } from './accordion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ValidationMessage, MatValidationMessage, SearchTextComponent, SearchNumberComponent, SearchInActiveComponent, TermConditionModalComponent, PartySizeModalComponent } from './components';
import { LowercaseDirective, SpaceRestrictDirective } from './directives';
import { SafePipe, HTMLSanitizePipe, SearchTablePipe } from './pipes';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatModule } from './mat.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileUploadModule } from 'ng2-file-upload';
import { TranslateService } from "@ngx-translate/core";
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
const sharedModule = [CommonModule, FormsModule, ReactiveFormsModule, MatModule, RouterModule, FlexLayoutModule, NgxDatatableModule, FileUploadModule, TranslateModule];

const sharedDirectives = [AccordionAnchorDirective, AccordionLinkDirective, AccordionDirective, LowercaseDirective, SpaceRestrictDirective];

const entryComponents = []

const sharedPipes = [SafePipe, HTMLSanitizePipe, SearchTablePipe];

const sharedServices = [MenuItems, DatePipe];

const sharedComponents = [ValidationMessage, MatValidationMessage, SearchTextComponent, SearchNumberComponent, SearchInActiveComponent, TermConditionModalComponent, PartySizeModalComponent];

@NgModule({
  imports: [
    ...sharedModule,
  ],
  declarations: [
    ...sharedDirectives,
    ...sharedComponents,
    ...sharedPipes,
    ...entryComponents
  ],
  exports: [
    ...sharedModule,
    ...sharedDirectives,
    ...sharedComponents,
    ...sharedPipes
  ],
  entryComponents: [
    ...entryComponents
  ],
  providers: [
    ...sharedServices
  ]
})
export class SharedModule { }
