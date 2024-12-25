import {Component, Output, EventEmitter, inject, OnDestroy} from '@angular/core';
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
export class HeaderComponent implements OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  authService = inject(AuthService);
  user$ = this.authService.user$;
  isFullscreen = false;
  private autoNavigationInterval: any;

  constructor(private router: Router) {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
    
    // Start auto-navigation when component is created
    this.startAutoNavigation();
  }

  ngOnDestroy() {
    // Clean up the interval when component is destroyed
    this.stopAutoNavigation();
  }

  startAutoNavigation() {
    // Set interval to call navigateNext every 30 seconds
    this.autoNavigationInterval = setInterval(() => {
      this.navigateNext();
    }, 30000); // 30000 milliseconds = 30 seconds
  }

  stopAutoNavigation() {
    if (this.autoNavigationInterval) {
      clearInterval(this.autoNavigationInterval);
    }
  }

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
