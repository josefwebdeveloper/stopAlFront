import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  constructor() {
    // Check localStorage on service initialization
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  loginWithGoogle() {
    window.location.href = 'https://stopalcholnode.vercel.app/auth/google';
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    // Optionally, redirect to backend logout endpoint
    window.location.href = 'https://stopalcholnode.vercel.app/logout';
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }
} 