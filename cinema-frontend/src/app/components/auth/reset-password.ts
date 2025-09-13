import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword implements OnInit {
  form: FormGroup;
  token: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    if (this.form.invalid || !this.token) {
      this.notificationService.showError('Vui lòng nhập đầy đủ thông tin và kiểm tra token.');
      return;
    }
    this.loading = true;
    const { newPassword, confirmPassword } = this.form.value;
    this.authService.resetPassword(this.token, newPassword, confirmPassword).subscribe({
      next: (response) => {
        if (response.state === 'SUCCESS') {
          this.notificationService.showSuccess('Bạn đã thay đổi password thành công nhấn vào <a href="/login" style="color: #fff; text-decoration: underline;">Tại đây</a> để đi đến đăng nhập');
        } else {
          this.notificationService.showError(response.message || 'Đặt lại mật khẩu thất bại.');
        }
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError(error.message || 'Đặt lại mật khẩu thất bại.');
        this.loading = false;
      }
    });
  }
}
