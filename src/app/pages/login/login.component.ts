import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div>
      <h1>Login</h1>
      <button (click)="login()">Login with Google</button>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  login() {
    this.authService.loginWithGoogle();
  }
}
