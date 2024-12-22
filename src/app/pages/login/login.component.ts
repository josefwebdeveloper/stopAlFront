import { Component } from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {AuthService} from '../../services/auth.service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatIcon,
    MatCardSubtitle,
    MatCardTitle
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private authService: AuthService) {
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }
}
