import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async canActivate(): Promise<boolean> {
    console.log('[AdminGuard] Checking admin access...');
    
    // Kiểm tra quyền admin với token validation (bao gồm refresh nếu cần)
    const isAdmin = await this.authService.isAdminWithValidToken();
    
    if (isAdmin) {
      console.log('[AdminGuard] Admin access granted');
      return true;
    } else {
      console.log('[AdminGuard] Admin access denied, redirecting to home');
      this.authService.clearTokens();
      this.router.navigate(['/']);
      return false;
    }
  }
} 