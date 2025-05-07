import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router

  ) {}

  canActivate(): boolean {
    console.log(this.authService.isAuthenticated(), 'AuthGuard');
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Redirect to login page if not authenticated
    this.router.navigate(['/login']);
    return false;
  }
}
