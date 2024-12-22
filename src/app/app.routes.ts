import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';

export const routes: Routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  // Redirect to login by default
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
];
