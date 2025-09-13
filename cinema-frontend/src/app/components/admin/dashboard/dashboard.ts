import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../services/notification';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  // Loading state
  loading = false;

  // Thống kê tổng quan
  stats = {
    totalMovies: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0
  };

  // Dữ liệu biểu đồ
  chartData = {
    dailyRevenue: [12000, 15000, 18000, 14000, 22000, 25000, 28000],
    moviePerformance: [
      { name: 'Avengers: Endgame', revenue: 45000, bookings: 120 },
      { name: 'Spider-Man: No Way Home', revenue: 38000, bookings: 95 },
      { name: 'Black Panther', revenue: 32000, bookings: 85 },
      { name: 'Doctor Strange', revenue: 28000, bookings: 70 }
    ]
  };

  // Danh sách phim đang chiếu
  currentMovies = [
    { id: 1, title: 'Avengers: Endgame', poster: 'https://via.placeholder.com/150x200', status: 'Đang chiếu', bookings: 120 },
    { id: 2, title: 'Spider-Man: No Way Home', poster: 'https://via.placeholder.com/150x200', status: 'Đang chiếu', bookings: 95 },
    { id: 3, title: 'Black Panther', poster: 'https://via.placeholder.com/150x200', status: 'Đang chiếu', bookings: 85 }
  ];

  // Đặt hàng gần đây
  recentBookings = [
    { id: 1, customer: 'Nguyễn Văn A', movie: 'Avengers: Endgame', seats: 'A1, A2', amount: 200000, time: '14:30' },
    { id: 2, customer: 'Trần Thị B', movie: 'Spider-Man', seats: 'B3, B4', amount: 200000, time: '16:45' },
    { id: 3, customer: 'Lê Văn C', movie: 'Black Panther', seats: 'C5', amount: 100000, time: '19:15' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private adminService: AdminService
  ) {}

  async ngOnInit() {
    // Kiểm tra quyền admin với token validation
    const hasAccess = await this.authService.validateAdminAccess(this.router, this.notificationService);
    if (!hasAccess) {
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load dashboard overview
    this.adminService.getDashboardOverview().subscribe({
      next: (response) => {
        if (response.data) {
          this.stats = {
            totalMovies: response.data.totalMovies || 0,
            totalBookings: response.data.totalBookings || 0,
            totalRevenue: response.data.totalRevenue || 0,
            activeUsers: response.data.totalUsers || 0
          };
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('[Dashboard] Error loading overview:', error);
        this.notificationService.showError(error.message || 'Lỗi khi tải dữ liệu dashboard');
        this.loading = false;
      }
    });
  }

  getRankClass(index: number): string {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return 'rank-normal';
  }

  async navigateToMovieManagement() {
    // Kiểm tra quyền admin với token validation trước khi chuyển trang
    const hasAccess = await this.authService.validateAdminAccess(this.router, this.notificationService);
    if (!hasAccess) {
      return;
    }
    this.router.navigate(['/admin/movie-management']);
  }

  async navigateToBookingManagement() {
    console.log('[Dashboard] Navigating to booking management...');
    
    try {
      // Test navigation trực tiếp trước
      console.log('[Dashboard] Attempting direct navigation...');
      
      // Thử navigation đơn giản trước
      this.router.navigate(['/admin/booking-management']);
      console.log('[Dashboard] Navigation command sent');
      
    } catch (error) {
      console.error('[Dashboard] Error during navigation:', error);
      this.notificationService.showError('Lỗi khi chuyển trang');
    }
  }

  async navigateToUserManagement() {
    // Kiểm tra quyền admin với token validation trước khi chuyển trang
    const hasAccess = await this.authService.validateAdminAccess(this.router, this.notificationService);
    if (!hasAccess) {
      return;
    }
    this.router.navigate(['/admin/user-management']);
  }

  logout() {
    this.authService.clearTokens();
    localStorage.removeItem('userInfo');
    this.router.navigate(['/']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
}
