import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AutoLoginComponent, HomeComponent } from './components';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'autologin', component: AutoLoginComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
