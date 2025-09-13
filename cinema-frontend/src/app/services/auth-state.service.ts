import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    console.log('[AuthStateService] Constructor called');
    // Initialize state from localStorage
    this.updateAuthState();
  }

  // Observable để subscribe khi trạng thái auth thay đổi
  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get userRole$(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  // Get current values
  get isAuthenticated(): boolean {
    const value = this.isAuthenticatedSubject.value;
    console.log('[AuthStateService] Getting isAuthenticated:', value);
    return value;
  }

  get userRole(): string | null {
    return this.userRoleSubject.value;
  }

  // Update authentication state
  updateAuthState(): void {
    console.log('[AuthStateService] Updating auth state');
    const isLoggedIn = this.isLoggedIn();
    const userRole = this.getUserRole();
    
    console.log('[AuthStateService] Local check - isLoggedIn:', isLoggedIn, 'userRole:', userRole);
    
    this.isAuthenticatedSubject.next(isLoggedIn);
    this.userRoleSubject.next(userRole);
    
    console.log('[AuthStateService] Auth state updated:', { isLoggedIn, userRole });
  }

  // Notify when user logs in
  notifyLogin(): void {
    console.log('[AuthStateService] Notifying login');
    this.updateAuthState();
  }

  // Notify when user logs out
  notifyLogout(): void {
    console.log('[AuthStateService] Notifying logout');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
    console.log('[AuthStateService] User logged out');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const accessToken = localStorage.getItem('accessToken');
    const result = !!accessToken;
    console.log('[AuthStateService] Checking isLoggedIn - accessToken exists:', !!accessToken, 'result:', result);
    return result;
  }

  // Get user role from token
  getUserRole(): string | null {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('[AuthStateService] No access token for role check');
      return null;
    }
    
    try {
      const decoded = this.decodeToken(accessToken);
      const role = decoded?.role || null;
      console.log('[AuthStateService] Decoded role from token:', role);
      return role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Decode JWT token
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.userRole === 'ROLE_ADMIN';
  }

  // Check if user is regular user
  isUser(): boolean {
    return this.userRole === 'ROLE_USER';
  }
} 