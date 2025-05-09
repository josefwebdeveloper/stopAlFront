import {Routes} from '@angular/router';
import {AuthCallbackComponent} from './components/auth-callback/auth-callback.component';
import {AuthGuard} from './guards/auth.guard';
import {LoginComponent} from './pages/login/login.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {SettingsComponent} from './pages/settings/settings.component';
import {TripDescriptionComponent} from './pages/trip-description/trip-description.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { AddDataPopupComponent } from './components/add-data-popup/add-data-popup.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';

export const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {path: 'auth-callback', component: AuthCallbackComponent},
  {path: 'settings', component: SettingsComponent},
  {
    path: 'trip-description', component: TripDescriptionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar',
    component: CalendarComponent
  },
  {path: '**', redirectTo: '/login'}
];
