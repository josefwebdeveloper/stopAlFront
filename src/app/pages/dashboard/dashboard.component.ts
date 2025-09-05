import {Component, inject, DestroyRef, OnInit, OnDestroy} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AddDataPopupComponent } from '../../components/add-data-popup/add-data-popup.component';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import { AuthService } from '../../services/auth.service';
import { Entry, EntryData, LastImage } from '../../interfaces/entry-data.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { switchMap, tap, filter } from 'rxjs/operators';

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
export class DashboardComponent implements OnInit, OnDestroy {
  entries: Entry[] = [];
  latestEntry?: Entry;
  totalEarned = 0;
  lastImage?: LastImage;
  private readonly destroyRef = inject(DestroyRef);
  private refreshTrigger = new BehaviorSubject<void>(undefined);
  readonly TENNIS_LESSON_COST = 200;
  private moneyRainInterval: any = null;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    // Subscribe to the existing entries$ observable
    this.authService.entries$.pipe(
      filter(data => !!data),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: EntryData | null) => {
        if (data) {
          this.entries = data.entries;
          this.latestEntry = data.entries[0];
          this.totalEarned = data.totalEarned;
          this.lastImage = data.lastImage;
          console.log('Latest entry:', this.latestEntry);
          console.log('Last image:', this.lastImage);
        }
      }
    });

    // Keep the manual refresh capability
    this.refreshTrigger.pipe(
      switchMap(() => this.authService.getEntries()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: EntryData) => {
        this.entries = data.entries;
        this.latestEntry = data.entries[0];
        this.totalEarned = data.totalEarned;
        this.lastImage = data.lastImage;
        console.log('Manually refreshed latest entry:', this.latestEntry);
      },
      error: (error) => {
        console.error('Error loading entries:', error);
        if (error.status === 401) {
          this.authService.loginWithGoogle();
        }
      }
    });
  }

  ngOnInit() {
    // Start the money rain animation loop
    this.startMoneyRain();
  }

  ngOnDestroy() {
    // Clean up the interval when component is destroyed
    if (this.moneyRainInterval) {
      clearInterval(this.moneyRainInterval);
      this.moneyRainInterval = null;
    }
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

  openImageUpload() {
    const dialogRef = this.dialog.open(ImageUploadComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      if (result) {
        console.log('Image uploaded:', result);
        // Refresh data to get the new image
        this.refreshTrigger.next();
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

  get daysWithoutAlcohol(): number {
    let consecutiveDays = 0;
    for (const entry of this.entries) {
      if (!entry.alcohol) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    return consecutiveDays;
  }

  get weeklyEarnings(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return this.entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo;
      })
      .reduce((sum, entry) => sum + (entry.earned || 0), 0);
  }

  get monthlyEarnings(): number {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return this.entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneMonthAgo;
      })
      .reduce((sum, entry) => sum + (entry.earned || 0), 0);
  }

  get soberMessage(): string {
    if (this.daysWithoutAlcohol === 0) return "Time to start fresh! 💫";
    if (this.daysWithoutAlcohol === 1) return "Day 1! The journey begins! 🌱";
    if (this.daysWithoutAlcohol <= 3) return `${this.daysWithoutAlcohol} days - You're on fire! 🔥`;
    if (this.daysWithoutAlcohol <= 5) return `${this.daysWithoutAlcohol} days - Unstoppable! 🚀`;
    if (this.daysWithoutAlcohol <= 7) return `${this.daysWithoutAlcohol} days - Superstar! ⭐`;
    if (this.daysWithoutAlcohol <= 14) return `${this.daysWithoutAlcohol} days - Legendary! 👑`;
    return `${this.daysWithoutAlcohol} days - GODLIKE! 🌟✨`;
  }

  get weeklyTrendEmoji(): string {
    if (this.weeklyEarnings === 0) return '📊';
    if (this.weeklyEarnings < 100) return '📈';
    if (this.weeklyEarnings < 200) return '🚀';
    return '💫';
  }

  get monthlyMessage(): string {
    const tennisLessons = Math.floor(this.monthlyEarnings / this.TENNIS_LESSON_COST);
    if (this.monthlyEarnings === 0) return 'Let\'s get started! 📊';
    if (tennisLessons === 0) return 'Almost a tennis lesson! 🎾';
    if (tennisLessons === 1) return 'One lesson earned! 🎾';
    return `${tennisLessons} tennis lessons! 🏆`;
  }

  private startMoneyRain() {
    // Clear any existing interval first
    if (this.moneyRainInterval) {
      clearInterval(this.moneyRainInterval);
    }

    // Set a new interval with proper reference for cleanup
    this.moneyRainInterval = setInterval(() => {
      const moneyRain = document.querySelector('.money-rain') as HTMLElement;
      const snowFall = document.querySelector('.snow-fall') as HTMLElement;

      if (moneyRain) {
        moneyRain.style.animation = 'none';
        moneyRain.offsetHeight; // Trigger reflow
        moneyRain.style.animation = 'trigger-effects 10s infinite';
      }

      if (snowFall) {
        snowFall.style.animation = 'none';
        snowFall.offsetHeight; // Trigger reflow
        snowFall.style.animation = 'trigger-effects 10s infinite';
      }
    }, 10000); // Runs every 10 seconds
  }
}
