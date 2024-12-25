import {Component, Output, EventEmitter, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {RouterModule, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

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
    MatMenuModule,
    RouterModule
  ]
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  authService = inject(AuthService);
  user$ = this.authService.user$;
  isFullscreen = false;

  async toggleFullscreen() {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        this.isFullscreen = true;
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        this.isFullscreen = false;
      }
    }
  }

  constructor(private router: Router) {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
  }

  login() {
    this.authService.loginWithGoogle();
  }

  logout() {
    this.authService.logout();
  }

  navigateNext() {
    const currentUrl = this.router.url;
    switch (currentUrl) {
      case '/dashboard':
        this.router.navigate(['/profile']);
        break;
      case '/profile':
        this.router.navigate(['/trip-description']);
        break;
      case '/trip-description':
        this.router.navigate(['/settings']);
        break;
      case '/settings':
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}
