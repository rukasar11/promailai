import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InboxComponent } from './components/inbox/inbox.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'inbox', component: InboxComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
