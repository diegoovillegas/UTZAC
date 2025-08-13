import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AspirantesPageRoutingModule } from './aspirantes-routing.module';

import { AspirantesPage } from './aspirantes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AspirantesPageRoutingModule
  ],
  declarations: [AspirantesPage]
})
export class AspirantesPageModule {}