import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  impactPoints: number;
  mealsShared: number;
  mealsReceived: number;
  role: 'student' | 'moderator' | 'admin';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isLoggedIn.set(true);
    }
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    accountType?: 'client' | 'administrator';
    adminSignupCode?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
        this.isLoggedIn.set(true);
      })
    );
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(...roles: Array<'student' | 'moderator' | 'admin'>): boolean {
    const role = this.currentUser()?.role;
    return !!role && roles.includes(role);
  }

  isAdminOrModerator(): boolean {
    return this.hasRole('admin', 'moderator');
  }
}
