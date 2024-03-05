import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';

const modules = [
    MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatTooltipModule, MatCardModule, MatMenuModule, MatToolbarModule,
    MatSidenavModule, MatBadgeModule, MatListModule, MatSelectModule, MatNativeDateModule,
    MatDatepickerModule, MatRadioModule, MatDividerModule, MatTabsModule,
    MatExpansionModule
];

@NgModule({
    imports: [
        ...modules,
    ],
    exports: [
        ...modules,
    ],
})
export class MatModule { }