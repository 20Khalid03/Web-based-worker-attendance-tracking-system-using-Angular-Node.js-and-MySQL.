import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { OuvrierSettingsComponent } from './components/ouvrier-settings/ouvrier-settings.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'dashboard-ouvrier', 
    component: DashboardOuvrierComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'ouvrier' } 
  },
  { path: 'Absence-Notifications', component: AbsenceNotificationsComponent },
  { path: 'Absence-List', component: AbsentListComponent },
  { path: 'ouvrier-settings', component: OuvrierSettingsComponent },
  { path: 'user-settings', component: UserSettingsComponent },
  { 
    path: 'ouvrier', 
    component: OuvrierComponent, 
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile/:id', 
    component: SingleProfileComponent, 
    canActivate: [AuthGuard]
  },
  { 
    path: 'utilisateurs', 
    component: UtilisateursComponent, 
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'app-visualisation', 
    component: VisualisationComponent, 
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'worker-report', 
    component: WorkerReportComponent, 
    canActivate: [AuthGuard]
  },
  // Route par défaut
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // Route wildcard (doit être la dernière)
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }