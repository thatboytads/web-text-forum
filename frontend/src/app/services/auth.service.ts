import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Token, User, UserCreate, UserRole } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    let storedUser: string | null = null;
    if (this.isBrowser) {
      const storedToken = localStorage.getItem('token');
      if (this.isTokenValid(storedToken)) {
        storedUser = localStorage.getItem('currentUser');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      }
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/token`, { username, password })
      .pipe(
        tap(token => {
          if (this.isBrowser) {
            localStorage.setItem('token', token.access_token);
            // Decode JWT to get user info
            const payload = this.parseJwt(token.access_token);
            const user: User = {
              id: payload.user_id || 0,
              username: payload.sub,
              role: payload.role || UserRole.REGULAR,
              is_active: true
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  register(username: string, password: string, role?: UserRole): Observable<User> {
    const userData: UserCreate = { username, password, role };
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.isTokenValid(this.getToken()) && !!this.currentUserValue;
  }

  isModerator(): boolean {
    const user = this.currentUserValue;
    return user ? user.role === UserRole.MODERATOR : false;
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  }

  private isTokenValid(token: string | null): boolean {
    if (!token || !this.isBrowser) {
      return false;
    }
    const payload = this.parseJwt(token);
    if (!payload?.exp) {
      return false;
    }
    return Date.now() / 1000 < payload.exp;
  }
}
