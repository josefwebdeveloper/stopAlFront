import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith, filter, timer } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Entry, EntryData } from '../interfaces/entry-data.interface';
import { retry } from 'rxjs/operators';

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
    interval(120000)
      .pipe(
        startWith(0),
        filter(() => this.isAuthenticated()),
        switchMap(() => this.getEntries())
      )
      .subscribe({
        next: (entries) => this.entriesSubject.next(entries),
        error: (error) => {
          console.error('Error fetching entries:', error);
          // Keep isPollingActive true since the interval will continue
        }
      });
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
    console.log('User:', this.userSubject.value);
    const user = this.userSubject.value;
    console.log('Token:', user?.token);
    console.log('Is authenticated:', user !== null && !!user.token);
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
        delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000)
      })
    );
  }
}
