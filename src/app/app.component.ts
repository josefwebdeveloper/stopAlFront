import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { IconService } from './services/icon.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
    RouterModule,
    HeaderComponent,
    MatSidenavModule,
    MatListModule,
    MatIconModule
]
})
export class AppComponent {
  title = 'stop-al-front';
  isSidenavOpen = false;

  constructor(private iconService: IconService) {}

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  closeSidenav() {
    this.isSidenavOpen = false;
  }
}
