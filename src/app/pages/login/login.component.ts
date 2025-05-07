import { Component ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
    ]
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }
}
