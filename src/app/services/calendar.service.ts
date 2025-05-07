import { Injectable, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { Entry, EntryData } from '../interfaces/entry-data.interface';

export interface DrinkingDay {
  date: string;
  isDrinking: boolean;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService implements OnDestroy {
  private cachedEntries: EntryData | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  private entriesSubscription: Subscription;

  constructor(private authService: AuthService) {
    // Subscribe to the entries$ to keep local cache updated
    this.entriesSubscription = this.authService.entries$.subscribe(entries => {
      if (entries) {
        this.cachedEntries = entries;
        this.lastFetchTime = Date.now();
      }
    });
  }

  ngOnDestroy() {
    if (this.entriesSubscription) {
      this.entriesSubscription.unsubscribe();
    }
  }

  async getDrinkingDays(startDate: Date, endDate: Date): Promise<DrinkingDay[]> {
    // Use cached data if it's available and not too old
    if (this.cachedEntries && (Date.now() - this.lastFetchTime < this.CACHE_TTL)) {
      console.log('Using cached entries for calendar');
      return this.mapEntriesToDrinkingDays(this.cachedEntries);
    }
    
    try {
      // Otherwise fetch new data
      const entries = await firstValueFrom(this.authService.getEntries());
      this.cachedEntries = entries;
      this.lastFetchTime = Date.now();
      return this.mapEntriesToDrinkingDays(entries);
    } catch (error) {
      console.error('Error fetching drinking days:', error);
      // Return cached data even if it's expired in case of error
      if (this.cachedEntries) {
        console.log('Using expired cached entries due to error');
        return this.mapEntriesToDrinkingDays(this.cachedEntries);
      }
      return [];
    }
  }

  private mapEntriesToDrinkingDays(entries: EntryData): DrinkingDay[] {
    return entries.entries.map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      isDrinking: entry.alcohol,
    }));
  }

  async toggleDrinkingDay(date: Date, isDrinking: boolean): Promise<void> {
    try {
      await firstValueFrom(this.authService.addEntry({
        date: date.toISOString(),
        alcohol: isDrinking,
        createdAt: new Date().toISOString(),
        id: date.toISOString(),
        earned: 0,
      }));
    } catch (error) {
      console.error('Error toggling drinking day:', error);
      throw error;
    }
  }
} 