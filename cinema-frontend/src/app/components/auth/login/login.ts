import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, FormsModule]
})
export class Login implements OnInit {
  loginData = { username: '', password: '' };
  loading = false;
  error: string = '';
  returnUrl: string = '/';
  movieId: string | null = null;
  showtimeId: string | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get return url from route parameters or default to '/'
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
      this.movieId = params['movieId'] || null;
      this.showtimeId = params['showtimeId'] || null;
    });
  }

  onLogin() {
    this.error = '';
    if (!this.loginData.username || !this.loginData.password) {
      this.error = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }
    this.loading = true;
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.state === 'SUCCESS' && response.object) {
          this.authService.saveTokens(response.object.accessToken, response.object.refreshToken);
          // Optionally save user info
          const userInfo = {
            username: this.loginData.username,
            email: response.object.email || '',
            roles: response.object.roles || [],
          };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          // Redirect to return URL or home/dashboard
          if (response.object.roles && response.object.roles.includes('ADMIN')) {
            this.router.navigate(['/admin/dashboard']);
          } else if (this.returnUrl && this.returnUrl !== '/') {
            // If we have movieId and showtimeId, reconstruct the booking URL
            if (this.movieId && this.showtimeId) {
              this.router.navigate(['/booking'], { 
                queryParams: { 
                  movieId: this.movieId, 
                  showtimeId: this.showtimeId 
                } 
              });
            } else {
              this.router.navigateByUrl(this.returnUrl);
            }
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.error = response.message || 'Tên đăng nhập hoặc mật khẩu không chính xác';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = (err && err.error && err.error.message) || err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác';
        this.loading = false;
      }
    });
  }
}
