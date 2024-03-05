import { NgModule } from '@angular/core';
import { ProfileComponents, ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from '@app-shared';
import { ProfileService } from './profile.service';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
    declarations: [
        ...ProfileComponents
    ],
    imports: [
        SharedModule,
        ProfileRoutingModule,
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
    ],
    providers: [
        ProfileService,
        BsModalService
    ]
})
export class ProfileModule { }