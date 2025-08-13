import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistroPublicoPageRoutingModule } from './registro-publico-routing.module';

import { RegistroPublicoPage } from './registro-publico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroPublicoPageRoutingModule
  ],
  declarations: [RegistroPublicoPage]
})
export class RegistroPublicoPageModule {}