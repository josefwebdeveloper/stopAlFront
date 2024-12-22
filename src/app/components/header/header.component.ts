import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AddDataPopupComponent } from '../add-data-popup/add-data-popup.component';

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
    MatIconModule,
    MatDialogModule
  ]
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  
  constructor(
    public authService: AuthService,
    private dialog: MatDialog
  ) {}

  onLogout() {
    this.authService.logout();
  }

  openAddDataPopup() {
    const dialogRef = this.dialog.open(AddDataPopupComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.addEntry(result).subscribe({
          next: () => {
            // Handle success - maybe show a snackbar
            console.log('Entry added successfully');
          },
          error: (error) => {
            // Handle error - show error message
            console.error('Error adding entry:', error);
          }
        });
      }
    });
  }
} 