import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ReportesPageRoutingModule } from './reportes-routing.module';

import { ReportesPage } from './reportes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ReportesPageRoutingModule
  ],
  declarations: [ReportesPage]
})
export class ReportesPageModule {}