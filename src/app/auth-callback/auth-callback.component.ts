import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  template: '<div>Processing authentication...</div>',
  standalone: true,
  imports: [CommonModule]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['user']) {
        const userInfo = JSON.parse(decodeURIComponent(params['user']));
        this.authService.setUser(userInfo);
        this.router.navigate(['/profile']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
} 