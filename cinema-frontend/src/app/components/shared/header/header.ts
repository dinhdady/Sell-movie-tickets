import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthModal } from '../../auth/auth-modal/auth-modal';
import { AuthService } from '../../../services/auth';
import { AuthStateService } from '../../../services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, AuthModal],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit, OnDestroy {
  showAuthModal = false;
  showUserDropdown = false;
  isLoggedIn = false;
  userInfo: any = null;
  searchQuery = '';
  authMode: 'login' | 'register' = 'login';
  private authStateSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private authStateService: AuthStateService
  ) {
    console.log('[Header] Constructor called');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close dropdown if clicking outside
    if (this.showUserDropdown) {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        this.closeUserDropdown();
      }
    }
  }

  ngOnInit() {
    console.log('[Header] ngOnInit called');
    this.subscribeToAuthState();
    this.checkAuthStatus();
  }

  ngOnDestroy() {
    console.log('[Header] ngOnDestroy called');
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  private subscribeToAuthState() {
    console.log('[Header] Subscribing to auth state');
    this.authStateSubscription = this.authStateService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        console.log('[Header] Auth state changed:', isAuthenticated);
        this.isLoggedIn = isAuthenticated;
        if (isAuthenticated) {
          this.loadUserInfo();
        } else {
          this.userInfo = null;
        }
      }
    );
  }

  private loadUserInfo() {
    console.log('[Header] Loading user info');
    // Try to get user info from localStorage first
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        this.userInfo = JSON.parse(userInfoStr);
        console.log('[Header] User info loaded from localStorage:', this.userInfo);
      } catch (error) {
        console.error('Error parsing user info:', error);
        this.userInfo = null;
      }
    }
    
    // If no user info in localStorage, try to get from service
    if (!this.userInfo) {
      console.log('[Header] No user info in localStorage, trying to get from service');
      // You can implement a method to get current user info from API
      // this.userService.getCurrentUser().subscribe(...)
    }
  }

  checkAuthStatus() {
    console.log('[Header] Checking auth status');
    const authServiceStatus = this.authService.isLoggedIn();
    const authStateStatus = this.authStateService.isAuthenticated;
    console.log('[Header] AuthService status:', authServiceStatus);
    console.log('[Header] AuthStateService status:', authStateStatus);
    
    this.isLoggedIn = authStateStatus;
    if (this.isLoggedIn) {
      this.loadUserInfo();
    }
  }

  openAuthModal(mode: 'login' | 'register' = 'login') {
    console.log('[Header] Opening auth modal with mode:', mode);
    this.authMode = mode;
    this.showAuthModal = true;
  }

  closeAuthModal() {
    console.log('[Header] Closing auth modal');
    this.showAuthModal = false;
    // Auth state will be updated automatically through subscription
  }

  refreshAuthStatus() {
    console.log('[Header] Refreshing auth status');
    this.authStateService.updateAuthState();
  }

  toggleUserDropdown() {
    console.log('[Header] Toggling user dropdown');
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeUserDropdown() {
    console.log('[Header] Closing user dropdown');
    this.showUserDropdown = false;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to movies page with search query
      console.log('Searching for:', this.searchQuery);
      // TODO: Implement search functionality
    }
  }

  onLogout() {
    console.log('[Header] Logging out');
    this.authService.logout().subscribe({
      next: () => {
        console.log('[Header] Logout successful');
        this.authService.clearTokens();
        localStorage.removeItem('userInfo');
        this.authStateService.notifyLogout();
        this.isLoggedIn = false;
        this.userInfo = null;
        this.showUserDropdown = false;
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still clear local data even if API call fails
        this.authService.clearTokens();
        localStorage.removeItem('userInfo');
        this.authStateService.notifyLogout();
        this.isLoggedIn = false;
        this.userInfo = null;
        this.showUserDropdown = false;
      }
    });
  }

  onMyTickets() {
    // Navigate to my tickets page
    console.log('Navigate to my tickets');
  }

  onAccountInfo() {
    // Navigate to account info page
    console.log('Navigate to account info');
  }

  onHelp() {
    // Navigate to help page
    console.log('Navigate to help');
  }
}
