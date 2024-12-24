import { Component, inject, DestroyRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AddDataPopupComponent } from '../../components/add-data-popup/add-data-popup.component';
import { AuthService } from '../../services/auth.service';
import { Entry, EntryData } from '../../interfaces/entry-data.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, interval, merge } from 'rxjs';
import { startWith, switchMap, tap } from 'rxjs/operators';

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
  private readonly destroyRef = inject(DestroyRef);
  private refreshTrigger = new BehaviorSubject<void>(undefined);
  readonly TENNIS_LESSON_COST = 200;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    const autoRefresh = interval(30000).pipe(startWith(0));
    const manualRefresh = this.refreshTrigger.asObservable();

    merge(autoRefresh, manualRefresh).pipe(
      switchMap(() => this.authService.getEntries()),
      takeUntilDestroyed(this.destroyRef)
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
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((result: Entry | undefined) => {
      console.log('The dialog was closed:', result);
      if (result) {
        this.authService.addEntry(result).pipe(
          tap(() => {
            console.log('Entry added:', result);
            this.refreshTrigger.next();
          }),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
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

  get tennisLessonsFuture(): string {
    const lessons = Math.floor(this.totalEarned / this.TENNIS_LESSON_COST);
    if (lessons === 0) return "Need more 💰 for 🎾!";
    if (lessons === 1) return "1 lesson... Just getting started! 🎾";
    if (lessons <= 3) return `${lessons} 🎾 (Novice mode)`;
    if (lessons <= 5) return `${lessons} 🎾 (Getting better!)`;
    if (lessons <= 10) return `${lessons} 🎾 (Future champion!)`;
    return `${lessons} 🎾 WIMBLEDON HERE WE COME! 🏆`;
  }

  get bmi(): number | null {
    if (!this.latestEntry?.weight) return null;
    // Assuming height is in meters and stored in the user profile
    // For now, let's use a default height of 1.75m
    const height = 1.75; // This should ideally come from user profile
    return Number((this.latestEntry.weight / (height * height)).toFixed(1));
  }

  get bmiCategory(): string {
    if (!this.bmi) return 'Step on the scale! ⚖️';
    if (this.bmi < 18.5) return 'Feather mode 🪶';
    if (this.bmi < 25) return 'Perfect like a tennis serve! 🎯';
    if (this.bmi < 30) return 'Time to chase some tennis balls! 🎾';
    return 'Extra power in your serve! 💪';
  }
}
