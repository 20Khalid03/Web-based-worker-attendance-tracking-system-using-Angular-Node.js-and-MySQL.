import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { FormsModule } from '@angular/forms'; // Assurez-vous d'importer ceci
import { InterceptorService } from './services/interceptor.service';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/Login/Login.component';
import { OuvrierComponent } from './components/ouvrier/ouvrier.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { SingleProfileComponent } from './components/singleprofile/singleprofile.component';
import { VisualisationComponent } from './components/visualisation/visualisation.component';
import { WorkerReportComponent } from './components/worker-report/worker-report.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardOuvrierComponent } from './components/dashboard-ouvrier/dashboard-ouvrier.component';
import { AbsenceNotificationsComponent } from './components/absence-notifications/absence-notifications.component';
import { AbsentListComponent } from './components/absent-list/absent-list.component';
import { SettingsComponent } from './components/settings/settings.component';
import { OuvrierSettingsComponent } from './components/ouvrier-settings/ouvrier-settings.component';
import { CustomAlertComponent } from './components/custom-alert/custom-alert.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        OuvrierComponent,
        DashboardComponent,
        ProfileComponent,
        UtilisateursComponent,
        SingleProfileComponent,
        VisualisationComponent,
        WorkerReportComponent,
        DashboardOuvrierComponent,
        AbsenceNotificationsComponent,
        AbsentListComponent,
        SettingsComponent,
        OuvrierSettingsComponent,
        CustomAlertComponent,
        UserSettingsComponent,
    ],
    bootstrap: [AppComponent],
     imports: [BrowserModule,
      
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule], providers: [
        AuthGuard,
        { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
