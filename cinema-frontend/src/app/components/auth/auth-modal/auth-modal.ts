import { Component, EventEmitter, Output, Input, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification';
import { MessageBox } from './message-box';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageBox],
  templateUrl: './auth-modal.html',
  styleUrls: ['./auth-modal.scss']
})
export class AuthModal implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<any>();
  @Input() initialMode: 'login' | 'register' = 'login';

  tab: 'login' | 'register' | 'forgot' = 'login';
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  private messageTimeout: any = null;
  forceRender = 0;

  // Form data
  loginData = { username: '', password: '' };
  registerData = { usernameR: '', emailR: '', passwordR: '', confirmPasswordR: '' };
  forgotData = { email: '' };

  // Password
  passwordStrength = { level: 'weak', text: 'Mật khẩu yếu' };
  passwordsMatch = true;

  constructor(
    private authService: AuthService, 
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    // Set initial tab based on input
    if (this.initialMode) {
      this.tab = this.initialMode;
    }
  }

  switchTab(tab: 'login' | 'register' | 'forgot', clearMsg = false) {
    console.log('[switchTab] Switching tab to:', tab, 'clearMsg:', clearMsg);
    this.tab = tab;
    if (clearMsg) {
      console.log('[switchTab] Clearing message due to tab switch');
      this.clearMessage();
    } else {
      console.log('[switchTab] Keeping message during tab switch');
    }
  }

  onClose() {
    console.log('Closing modal, clearing message');
    this.resetModal();
    this.close.emit();
  }

  resetModal() {
    // Clear tất cả message và timeout
    this.clearMessage();
    
    // Reset form data
    this.loginData = { username: '', password: '' };
    this.registerData = { usernameR: '', emailR: '', passwordR: '', confirmPasswordR: '' };
    this.forgotData = { email: '' };
    
    // Reset loading state
    this.loading = false;
    
    // Reset password strength
    this.passwordStrength = { level: 'weak', text: 'Mật khẩu yếu' };
    this.passwordsMatch = true;
    
    // Switch back to login tab
    this.tab = 'login';
  }

  clearMessage() {
    console.log('[clearMessage] === CLEAR MESSAGE CALLED ===');
    console.log('[clearMessage] Before clearing - message:', this.message, 'type:', this.messageType);
    this.zone.run(() => {
      this.message = '';
      this.messageType = 'success';
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
        this.messageTimeout = null;
        console.log('[clearMessage] Cleared timeout');
      }
    });
    console.log('[clearMessage] After clearing - message:', this.message, 'type:', this.messageType);
    console.log('[clearMessage] === END CLEAR MESSAGE ===');
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.zone.run(() => {
      this.message = message;
      this.messageType = type;
      this.forceRender++;
      
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
        this.messageTimeout = null;
      }
      
      // Set timeout to clear message after 8 seconds for error messages
      if (type === 'error') {
        this.messageTimeout = setTimeout(() => {
          this.zone.run(() => {
            this.clearMessage();
          });
        }, 8000);
      } else {
        // For success, clear after 1.5s
        this.messageTimeout = setTimeout(() => {
          this.zone.run(() => {
            this.clearMessage();
          });
        }, 1500);
      }
      
      // Reset forceRender after a short delay to allow *ngIf to update
      setTimeout(() => { 
        this.zone.run(() => {
          this.forceRender = 0;
        });
      }, 100);
    });
  }

  // Đăng nhập
  onLogin() {
    console.log('[onLogin] Called with:', this.loginData);
    if (!this.loginData.username || !this.loginData.password) {
      this.notificationService.showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    this.loading = true;
    this.cdr.detectChanges();
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('[onLogin] Login response:', response);
        if (response.state === 'SUCCESS') {
          const authResponse = response.object;
          if (authResponse && authResponse.accessToken && authResponse.refreshToken) {
            console.log('[AuthModal] Saving tokens and user info...');
            
            // Save tokens (this will automatically notify AuthStateService)
            this.authService.saveTokens(authResponse.accessToken, authResponse.refreshToken);
            
            // Save user info to localStorage
            const userInfo = {
              username: this.loginData.username,
              email: authResponse.email || '',
              roles: authResponse.roles || [],
            };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            console.log('[AuthModal] User info saved to localStorage:', userInfo);
            
            this.notificationService.showSuccess('Đăng nhập thành công! Chào mừng bạn trở lại!');
            
            // Kiểm tra role và điều hướng
            console.log('[AuthModal] User roles from response:', authResponse.roles);
            console.log('[AuthModal] User role from token:', this.authService.getUserRole());
            console.log('[AuthModal] Is admin check:', this.authService.isAdmin());
            
            if (this.authService.isAdmin()) {
              console.log('[AuthModal] User is admin, redirecting to admin dashboard');
              setTimeout(() => {
                this.close.emit();
                this.loginSuccess.emit(userInfo);
                this.router.navigate(['/admin/dashboard']);
              }, 1000);
            } else {
              console.log('[AuthModal] User is not admin, staying on current page');
              setTimeout(() => {
                this.close.emit();
                this.loginSuccess.emit(userInfo);
              }, 1000);
            }
          }
        } else {
          // Always show toast error on login failure
          this.notificationService.showError(response.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        // Always show toast error on login failure
        this.notificationService.showError(
          (error && error.error && error.error.message) || error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác'
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  checkPasswordStrength() {
    const password = this.registerData.passwordR;
    if (!password) {
      this.passwordStrength = { level: 'weak', text: 'Mật khẩu yếu' };
      return;
    }

    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine strength level
    if (score <= 2) {
      this.passwordStrength = { level: 'weak', text: 'Mật khẩu yếu' };
    } else if (score <= 4) {
      this.passwordStrength = { level: 'medium', text: 'Mật khẩu trung bình' };
    } else {
      this.passwordStrength = { level: 'strong', text: 'Mật khẩu khỏe' };
    }

    this.checkPasswordsMatch();
  }

  checkPasswordsMatch() {
    this.passwordsMatch = this.registerData.passwordR === this.registerData.confirmPasswordR;
  }

  // Đăng ký
  onRegister() {
    if (!this.registerData.usernameR || !this.registerData.emailR || !this.registerData.passwordR || !this.registerData.confirmPasswordR) {
      this.showMessage('Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }

    if (this.registerData.passwordR.length < 6) {
      this.showMessage('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    if (!this.passwordsMatch) {
      this.showMessage('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Register response received:', response, JSON.stringify(response));
        if (response.state === 'SUCCESS') {
          console.log('Registration successful, showing notification...');
          // Hiển thị thông báo thành công toàn cục
          this.notificationService.showSuccess('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
          // Chuyển sang tab đăng nhập
          this.switchTab('login', true);
          // Reset form
          this.registerData = { usernameR: '', emailR: '', passwordR: '', confirmPasswordR: '' };
        } else {
          this.showMessage(response.message || 'Đăng ký thất bại', 'error');
        }
      },
      error: (error) => {
        if (error.message) {
          this.showMessage(error.message, 'error');
        } else {
          this.showMessage('Đăng ký thất bại. Vui lòng thử lại.', 'error');
        }
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Quên mật khẩu
  onForgotPassword() {
    if (!this.forgotData.email) {
      this.notificationService.showError('Vui lòng nhập email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.forgotData.email)) {
      this.notificationService.showError('Email không hợp lệ');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    this.authService.forgotPassword(this.forgotData.email).subscribe({
      next: (response) => {
        if (response.state === 'SUCCESS') {
          this.notificationService.showSuccess('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.');
          this.forgotData.email = '';
        } else {
          // Show error toast if email does not exist or other error
          this.notificationService.showError(response.message || 'Email không tồn tại hoặc gửi email thất bại');
        }
      },
      error: (error) => {
        this.notificationService.showError(
          (error && error.error && error.error.message) || error.message || 'Gửi email thất bại. Vui lòng thử lại.'
        );
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }


} 