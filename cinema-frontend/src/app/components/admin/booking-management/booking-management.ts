import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification';

interface Booking {
  id: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
  showtime: {
    id: number;
    movie: {
      title: string;
      posterUrl: string;
    };
    startTime: string;
    room: {
      name: string;
    };
  };
  totalPrice: number;
  status: string;
  createdAt: string;
  seatNumbers: string[];
}

interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  todayRevenue: number;
  weekBookings: number;
  weekRevenue: number;
}

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './booking-management.html',
  styleUrls: ['./booking-management.scss']
})
export class BookingManagementComponent implements OnInit {
  // Math object for template usage
  Math = Math;
  
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  bookingStats: BookingStats = {
    totalBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    todayRevenue: 0,
    weekBookings: 0,
    weekRevenue: 0
  };
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;
  
  // Filters
  filterForm: FormGroup;
  searchQuery = '';
  selectedStatus = '';
  selectedMovie = '';
  selectedUser = '';
  
  // Loading states
  loading = false;
  statsLoading = false;
  
  // Modal states
  showBookingDetails = false;
  selectedBooking: Booking | null = null;
  
  // Export options
  exportForm: FormGroup;
  showExportModal = false;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.formBuilder.group({
      status: [''],
      movieTitle: [''],
      username: ['']
    });
    
    this.exportForm = this.formBuilder.group({
      startDate: [''],
      endDate: [''],
      format: ['excel']
    });
  }

  ngOnInit(): void {
    this.loadBookingStats();
    this.loadBookings();
    this.setupFilterListeners();
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadBookings();
    });
  }

  loadBookingStats(): void {
    this.statsLoading = true;
    this.adminService.getBookingStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.bookingStats = response.data;
        }
      },
      error: (error) => {
        this.notificationService.showError('Lỗi tải thống kê đặt vé');
        console.error('Error loading booking stats:', error);
      },
      complete: () => {
        this.statsLoading = false;
      }
    });
  }

  loadBookings(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.adminService.getAllBookings(
      this.currentPage,
      this.pageSize,
      filters.status,
      filters.movieTitle,
      filters.username
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.bookings = response.data.content;
          this.filteredBookings = this.bookings;
          this.totalPages = response.data.totalPages;
          this.totalItems = response.data.totalElements;
        }
      },
      error: (error) => {
        this.notificationService.showError('Lỗi tải danh sách đặt vé');
        console.error('Error loading bookings:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  searchBookings(): void {
    if (!this.searchQuery.trim()) {
      this.filteredBookings = this.bookings;
      return;
    }
    
    this.adminService.searchBookings(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.filteredBookings = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalItems = response.data.totalElements;
        }
      },
      error: (error) => {
        this.notificationService.showError('Lỗi tìm kiếm đặt vé');
        console.error('Error searching bookings:', error);
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadBookings();
  }

  viewBookingDetails(booking: Booking): void {
    this.selectedBooking = booking;
    this.showBookingDetails = true;
  }

  updateBookingStatus(bookingId: number, newStatus: string): void {
    this.adminService.updateBookingStatus(bookingId, newStatus).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Cập nhật trạng thái thành công');
          this.loadBookings();
          this.showBookingDetails = false;
        }
      },
      error: (error) => {
        this.notificationService.showError('Lỗi cập nhật trạng thái');
        console.error('Error updating booking status:', error);
      }
    });
  }

  cancelBooking(bookingId: number): void {
    if (confirm('Bạn có chắc chắn muốn hủy đặt vé này?')) {
      this.adminService.cancelBooking(bookingId).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.notificationService.showSuccess('Hủy đặt vé thành công');
            this.loadBookings();
            this.showBookingDetails = false;
          }
        },
        error: (error) => {
          this.notificationService.showError('Lỗi hủy đặt vé');
          console.error('Error cancelling booking:', error);
        }
      });
    }
  }

  exportBookings(): void {
    const exportData = this.exportForm.value;
    this.adminService.exportBookings(
      exportData.startDate,
      exportData.endDate,
      exportData.format
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Xuất báo cáo thành công');
          this.showExportModal = false;
        }
      },
      error: (error) => {
        this.notificationService.showError('Lỗi xuất báo cáo');
        console.error('Error exporting bookings:', error);
      }
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    this.currentPage = page;
    this.loadBookings();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBookings();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadBookings();
    }
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN');
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'badge-success';
      case 'PENDING': return 'badge-warning';
      case 'CANCELLED': return 'badge-danger';
      case 'COMPLETED': return 'badge-info';
      case 'EXPIRED': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PENDING': return 'Chờ xác nhận';
      case 'CANCELLED': return 'Đã hủy';
      case 'COMPLETED': return 'Hoàn thành';
      case 'EXPIRED': return 'Hết hạn';
      default: return status;
    }
  }

  closeModal(): void {
    this.showBookingDetails = false;
    this.showExportModal = false;
    this.selectedBooking = null;
  }

  refreshData(): void {
    this.loadBookingStats();
    this.loadBookings();
  }
} 