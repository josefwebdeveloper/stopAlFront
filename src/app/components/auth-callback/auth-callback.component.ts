import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

@Component({
    selector: 'app-auth-callback',
    template: '<div>Processing authentication...</div>',
    imports: []
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      console.log('Query params:', params);
      if (params['user']) {
        console.log('User authenticated:', params['user']);
        const userInfo = JSON.parse(decodeURIComponent(params['user']));
        console.log(userInfo);
        this.authService.setUser(userInfo);
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }

    });
  }

  ngOnDestroy() {
    // Cleanup will be handled by takeUntilDestroyed
  }
}
