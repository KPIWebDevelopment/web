import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, BehaviorSubject, of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(user: User, password: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/register`,
      {email: user.email, password: password, name: user.username},
      { responseType: 'text' }
    );
  }

  login(email: string, password: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/login`,
      { email, password },
      { responseType: 'text' }
    ).pipe(
      switchMap(token =>
        this.http.get<User>(`http://localhost:8080/email/${email}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).pipe(
          tap(user => this.storeUserData(user, token)),
          map(() => token),
          catchError(error => {
            console.error('Failed to fetch user data:', error);
            return of(token);
          })
        )
      )
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private storeUserData(user: User, token?: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    if(token) {
      localStorage.setItem(this.tokenKey, token);
    }
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue && !!this.getToken();
  }
}
