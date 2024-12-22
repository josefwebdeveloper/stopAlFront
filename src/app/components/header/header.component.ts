import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ]
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  
  constructor(public authService: AuthService) {}

  onLogout() {
    this.authService.logout();
  }
} 