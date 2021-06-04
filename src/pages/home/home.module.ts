import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { NumberDirective } from './number.directive';

import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { LazyForDirective } from './lazyFor.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    Ng2SearchPipeModule,
  ],
  declarations: [HomePage, NumberDirective, LazyForDirective],
})
export class HomePageModule {}
