// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));

import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
// import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { APP_ROUTES } from './app/app.routes';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';


bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        importProvidersFrom(CommonModule),
        provideRouter(APP_ROUTES),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideFirestore(() => getFirestore())
        // provideNoopAnimations(),
    ]
})
.catch(err => console.error(err));
