import {Component, Output, EventEmitter, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  authService=inject(AuthService);
  user$ = this.authService.user$;


  login() {
    this.authService.loginWithGoogle();
  }

  logout() {
    this.authService.logout();
  }
}
