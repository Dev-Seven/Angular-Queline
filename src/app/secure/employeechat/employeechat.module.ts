import { NgModule } from '@angular/core';
import { UserAuthService } from '@app-core';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProfileService } from '../profile/profile.service';
import { AccountService } from '../account/account.service';
import { PublicService } from 'src/app/public/public.service';
import { EmployeechatComponents,  EmployeechatRoutingModule } from './employeechat-routing.module';
import {  EmployeechatService } from './employeechat.service';
import { MatButtonModule, MatDialogModule, MatIconModule, MatInputModule, MatListModule, MatSidenavModule, MatSnackBarModule, MatToolbarModule } from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { SharedModule } from '@app-shared';

@NgModule({
    declarations: [
        [... EmployeechatComponents]
    ],
    imports: [
        EmployeechatRoutingModule,
        SharedModule,
        MatToolbarModule,MatIconModule,MatSidenavModule,MatInputModule,MatButtonModule,ScrollingModule,MatSnackBarModule,
        MatListModule, MatDialogModule,
        ScrollToModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase),
        FilterPipeModule,
        AngularFirestoreModule
    ],
    providers: [
        UserAuthService,
        EmployeechatService,
        ProfileService,
        AccountService,
        PublicService
    ],
    entryComponents: [
        
    ]
})
export class  EmployeechatModule { }