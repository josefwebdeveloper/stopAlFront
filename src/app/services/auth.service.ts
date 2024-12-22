import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EntryData } from '../interfaces/entry-data.interface';

interface User {
  id: string;
  displayName: string;
  email?: string;
  photoURL?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check localStorage on service initialization
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  // This starts the Google OAuth login on your Node server
  loginWithGoogle() {
    window.location.href = 'https://stopalcholnode.vercel.app/auth/google';
  }

  // If you want to store user info (returned after OAuth redirect),
  // you can do so here
  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    // Optionally redirect to a backend logout endpoint
    window.location.href = 'https://stopalcholnode.vercel.app/logout';
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }

  private getAuthHeaders(): HttpHeaders {
    // No more Bearer token; just JSON
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  addEntry(entryData: EntryData): Observable<EntryData> {
    const headers = this.getAuthHeaders();
    return this.http.post<EntryData>(
      `${environment.apiUrl}/api/entry`,
      entryData,
      {
        headers,
        withCredentials: true  // Include cookies
      }
    );
  }

  getEntries(): Observable<EntryData[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<EntryData[]>(
      `${environment.apiUrl}/api/entries`,
      {
        headers,
        withCredentials: true  // Include cookies
      }
    );
  }
}
