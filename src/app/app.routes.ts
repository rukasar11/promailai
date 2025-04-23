import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InboxComponent } from './components/inbox/inbox.component';
import { EmailDetailComponent } from './components/email-detail/email-detail.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

export const APP_ROUTES: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'inbox', component: InboxComponent },  
    { path: 'email/:id', component: EmailDetailComponent },
];
