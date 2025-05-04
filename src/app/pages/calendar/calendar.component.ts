import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService, DrinkingDay } from '../../services/calendar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface CalendarDay {
  date: Date;
  isDrinking: boolean;
  isCurrentMonth: boolean;
}

@Component({
    selector: 'app-calendar',
    imports: [CommonModule, MatProgressSpinnerModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  calendar: CalendarDay[][] = [];
  currentMonth: Date = new Date();
  loading = false;
  drinkingDays: Map<string, boolean> = new Map();

  constructor(private calendarService: CalendarService) {}

  async ngOnInit() {
    await this.generateCalendar();
  }

  private async loadDrinkingDays() {
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    
    const days = await this.calendarService.getDrinkingDays(firstDay, lastDay);
    this.drinkingDays.clear();
    days.forEach(day => {
      this.drinkingDays.set(day.date, day.isDrinking);
    });
  }

  async generateCalendar() {
    this.loading = true;
    await this.loadDrinkingDays();
    
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    
    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    
    // Add empty days until first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      currentWeek.push({ 
        date: new Date(firstDay.getTime() - ((firstDay.getDay() - i) * 86400000)),
        isDrinking: false,
        isCurrentMonth: false
      });
    }

    // Fill in the days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      
      currentWeek.push({
        date,
        isDrinking: this.drinkingDays.get(dateStr) ?? false,
        isCurrentMonth: true
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill in remaining days
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      const nextDate = new Date(lastDay.getTime() + (86400000 * (currentWeek.length + 1)));
      currentWeek.push({ 
        date: nextDate,
        isDrinking: false,
        isCurrentMonth: false
      });
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    this.calendar = weeks;
    this.loading = false;
  }

  async toggleDay(day: CalendarDay) {
    if (!day.isCurrentMonth || this.loading) return;
    
    this.loading = true;
    try {
      await this.calendarService.toggleDrinkingDay(day.date, !day.isDrinking);
      await this.generateCalendar();
    } catch (error) {
      console.error('Error toggling day:', error);
      // You might want to add a notification service to show errors to users
    } finally {
      this.loading = false;
    }
  }

  async previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
    await this.generateCalendar();
  }

  async nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
    await this.generateCalendar();
  }
} 