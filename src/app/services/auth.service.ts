import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  loginWithGoogle() {
    window.location.href = 'https://stopalcholnode.vercel.app/auth/google';
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    window.location.href = 'https://stopalcholnode.vercel.app/logout';
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
} 