import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroPublicoPage } from './registro-publico.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroPublicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroPublicoPageRoutingModule {}