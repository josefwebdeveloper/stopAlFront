import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AddDataPopupComponent } from '../../components/add-data-popup/add-data-popup.component';
import { AuthService } from '../../services/auth.service';
import { Entry, EntryData } from '../../interfaces/entry-data.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ]
})
export class DashboardComponent {
  entries: Entry[] = [];
  latestEntry?: Entry;
  totalEarned = 0;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    interval(10000).pipe(
      startWith(0),
      switchMap(() => this.authService.getEntries()),
      takeUntilDestroyed()
    ).subscribe({
      next: (data: EntryData) => {
        this.entries = data.entries;
        this.latestEntry = data.entries[0];
        this.totalEarned = data.totalEarned;
        console.log('Latest entry:', this.latestEntry);
      },
      error: (error) => {
        console.error('Error loading entries:', error);
        if (error.status === 401) {
          this.authService.loginWithGoogle();
        }
      }
    });
  }

  openAddDataPopup() {
    const dialogRef = this.dialog.open(AddDataPopupComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().pipe(
      takeUntilDestroyed()
    ).subscribe((result: Entry | undefined) => {
      if (result) {
        this.authService.addEntry(result).pipe(
          takeUntilDestroyed()
        ).subscribe({
          next: () => {
          },
          error: (error) => {
            console.error('Error adding entry:', error);
            if (error.status === 401) {
              this.authService.loginWithGoogle();
            }
          }
        });
      }
    });
  }
}
