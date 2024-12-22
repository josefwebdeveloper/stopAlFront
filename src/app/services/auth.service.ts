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
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  loginWithGoogle() {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
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

  addEntry(entryData: EntryData): Observable<EntryData> {
    return this.http.post<EntryData>(
      `${environment.apiUrl}/api/entry`,
      entryData,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  getEntries(): Observable<EntryData[]> {
    return this.http.get<EntryData[]>(
      `${environment.apiUrl}/api/entries`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
}
