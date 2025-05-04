import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  private hasToken(): boolean {
    if (typeof localStorage !== 'undefined') {
        return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  getToken(): string | null {
     if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(this.tokenKey);
     }
     return null;
  }

  private storeToken(token: string): void {
     if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.tokenKey, token);
        this.loggedIn.next(true);
     }
  }

  private removeToken(): void {
     if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.tokenKey);
        this.loggedIn.next(false);
     }
  }

  login(credentials: any): Observable<any> {
    return this.apiService.login(credentials).pipe(
      tap((response: any) => {
        if (response && response.access_token) {
          this.storeToken(response.access_token);
        } else {
           console.error('Login successful but no token received.');
           this.removeToken();
           throw new Error('Login successful but no token received.');
        }
      }),
      catchError(error => {
        this.removeToken();
        console.error('Login failed:', error);
        return throwError(() => new Error(error?.error?.detail || 'Login failed'));
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.apiService.register(userData).pipe(
      catchError(error => {
         console.error('Registration failed:', error);
         const message = error?.error?.detail || 'Registration failed';
         return throwError(() => new Error(message));
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }
}
