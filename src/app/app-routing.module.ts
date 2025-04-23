//mumani

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InboxComponent } from './components/inbox/inbox.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';//changes done here

const routes: Routes = [
  { path: '', component: LandingPageComponent },//changes done here
  { path: 'login', component: LoginComponent },//changes done here
  { path: 'inbox', component: InboxComponent },
  //{ path: '**', redirectTo: '', pathMatch: 'full' }//changes done here
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}



