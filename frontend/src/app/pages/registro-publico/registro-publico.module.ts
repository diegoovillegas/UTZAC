import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { RegistroPublicoPageRoutingModule } from './registro-publico-routing.module';

import { RegistroPublicoPage } from './registro-publico.page';

@NgModule({
  imports: [
     CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RegistroPublicoPageRoutingModule
  ],
  declarations: [RegistroPublicoPage]
})
export class RegistroPublicoPageModule {}