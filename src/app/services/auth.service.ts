import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith, filter, timer, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Entry, EntryData } from '../interfaces/entry-data.interface';
import { retry, catchError } from 'rxjs/operators';

interface User {
  id: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private entriesSubject = new BehaviorSubject<EntryData | null>(null);
  entries$ = this.entriesSubject.asObservable();
  private isPollingActive = false;
  private pollingBackoffTime = 120000; // Start with 2 minutes
  private maxPollingBackoff = 3600000; // Max 1 hour

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
      this.startEntriesPolling();
    }
  }

  private startEntriesPolling() {
    if (this.isPollingActive) return;
    
    this.isPollingActive = true;
    interval(this.pollingBackoffTime)
      .pipe(
        startWith(0),
        filter(() => this.isAuthenticated()),
        switchMap(() => this.getEntries().pipe(
          catchError(error => {
            console.error('Error in polling entries:', error);
            // Increase backoff time on resource exhausted errors
            if (error?.status === 500 && error?.error?.includes('RESOURCE_EXHAUSTED')) {
              this.increasePollingBackoff();
              console.log(`Increased polling interval to ${this.pollingBackoffTime / 1000} seconds due to quota issues`);
            }
            return throwError(() => error);
          })
        ))
      )
      .subscribe({
        next: (entries) => {
          this.entriesSubject.next(entries);
          // Reset backoff time on successful request
          this.resetPollingBackoff();
        },
        error: (error) => {
          console.error('Error fetching entries:', error);
          // Keep isPollingActive true since the interval will continue
        }
      });
  }

  private increasePollingBackoff() {
    // Double the backoff time, up to the maximum
    this.pollingBackoffTime = Math.min(this.pollingBackoffTime * 2, this.maxPollingBackoff);
  }

  private resetPollingBackoff() {
    if (this.pollingBackoffTime > 120000) {
      // Only reset if it was increased
      this.pollingBackoffTime = 120000;
    }
  }

  loginWithGoogle() {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
    
    // Only start polling if it's not already running
    if (!this.isPollingActive) {
      this.startEntriesPolling();
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.entriesSubject.next(null);
    this.isPollingActive = false;
    window.location.href = '/';
  }

  isAuthenticated(): boolean {
    const user = this.userSubject.value;
    return user !== null && !!user.token;
  }

  private getAuthHeaders(): HttpHeaders {
    const user = this.userSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token}`
    });
  }

  addEntry(entry: Entry): Observable<Entry> {
    return this.http.post<Entry>(
      `${environment.apiUrl}/api/entry`,
      entry,
      {
        headers: this.getAuthHeaders(),
      }
    ).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.log(`Retrying add entry, attempt ${retryCount}...`);
          return timer(Math.pow(2, retryCount) * 1000);
        }
      }),
      catchError(error => {
        console.error('Error adding entry after retries:', error);
        return throwError(() => error);
      })
    );
  }

  getEntries(): Observable<EntryData> {
    return this.http.get<EntryData>(
      `${environment.apiUrl}/api/entries`,
      {
        headers: this.getAuthHeaders(),
      }
    ).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying get entries, attempt ${retryCount} after ${delay}ms...`);
          // If it's a quota error, increase the delay substantially
          if (error?.status === 500 && error?.error?.includes('RESOURCE_EXHAUSTED')) {
            return timer(delay * 5);  // 5x longer for quota errors
          }
          return timer(delay);
        }
      }),
      catchError(error => {
        console.error('Error getting entries after retries:', error);
        return throwError(() => error);
      })
    );
  }
}
