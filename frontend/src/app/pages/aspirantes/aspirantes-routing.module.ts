import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AspirantesPage } from './aspirantes.page';

const routes: Routes = [
  {
    path: '',
    component: AspirantesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AspirantesPageRoutingModule {}