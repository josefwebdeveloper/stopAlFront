import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { Entry, EntryData } from '../interfaces/entry-data.interface';

export interface DrinkingDay {
  date: string;
  isDrinking: boolean;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  constructor(private authService: AuthService) {}

  async getDrinkingDays(startDate: Date, endDate: Date): Promise<DrinkingDay[]> {
    const entries = await firstValueFrom(this.authService.getEntries());
    return entries.entries.map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      isDrinking: entry.alcohol,
    }));
  }

  async toggleDrinkingDay(date: Date, isDrinking: boolean): Promise<void> {
    await firstValueFrom(this.authService.addEntry({
      date: date.toISOString(),
      alcohol: isDrinking,
      createdAt: new Date().toISOString(),
      id: date.toISOString(),
      earned: 0,
    }));
  }
} 