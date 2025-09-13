import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MovieService } from '../../../services/movie';
import { NotificationService } from '../../../services/notification';
import { AuthService } from '../../../services/auth';
import { Movie, MovieDTO } from '../../../models/movie';

@Component({
  selector: 'app-movie-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './movie-management.html',
  styleUrls: ['./movie-management.scss']
})
export class MovieManagement implements OnInit {
  movies: Movie[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalMovies = 0;
  loading = true; // Start with loading true to prevent template conflicts
  revenueLoading = false; // Separate loading state for revenue stats
  moviesLoading = false; // Separate loading state for movies
  
  // Make Math available in template
  Math = Math;
  
  // Form
  movieForm: FormGroup;
  isEditing = false;
  isAdding = false; // New property to track add form state
  editingMovieId: number | null = null;
  selectedFile: File | null = null;
  
  // Revenue stats
  revenueStats = {
    totalRevenue: 0,
    totalBookings: 0,
    averageRevenue: 0
  };

  constructor(
    private movieService: MovieService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.movieForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      releaseDate: ['', [Validators.required]],
      genre: ['', [Validators.required]],
      director: ['', [Validators.required]],
      cast: ['', [Validators.required]],
      rating: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
      status: ['NOW_SHOWING', [Validators.required]],
      filmRating: ['PG-13', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]]
    });
  }

  private async checkUserAuthentication() {
    // Kiểm tra quyền admin với token validation
    const hasAccess = await this.authService.validateAdminAccess(this.router, this.notificationService);
    if (!hasAccess) {
      return;
    }
  }

  async ngOnInit() {
    // Check user authentication first
    await this.checkUserAuthentication();
    
    // Add timeout to prevent infinite loading
    setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 2000); // 2 seconds timeout
    
    // Load movies first
    this.loadMovies();
    
    // Only load revenue stats if user is admin with valid token
    const isAdmin = await this.authService.isAdminWithValidToken();
    if (isAdmin) {
      this.loadRevenueStats();
    } else {
      // If not admin or token invalid, ensure loading is set to false after movies load
      setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }, 1000);
    }
  }

  loadMovies() {
    this.moviesLoading = true;
    this.cdr.detectChanges();
    
    this.movieService.getAllMovies(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.movies = response.movies || [];
        this.currentPage = response.currentPage || 0;
        this.totalPages = response.totalPages || 0;
        this.totalMovies = response.totalItems || 0;
        this.moviesLoading = false;
        this.cdr.detectChanges();
        
        // Show success notification only if there are movies
        if (this.movies.length > 0) {
          setTimeout(() => {
            this.notificationService.showInfo(`Đã tải ${this.movies.length} phim thành công!`);
          }, 500);
        }
      },
      error: (error) => {
        console.error('[MovieManagement] Error loading movies:', error);
        
        // Handle authentication errors
        if (error.originalError?.status === 401) {
          this.notificationService.showError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
          this.authService.clearTokens();
        } else {
          this.notificationService.showError(error.message || 'Lỗi khi tải danh sách phim');
        }
        
        this.moviesLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRevenueStats() {
    this.revenueLoading = true;
    this.cdr.detectChanges();
    
    this.movieService.getTotalRevenue().subscribe({
      next: (stats) => {
        this.revenueStats = stats || {
          totalRevenue: 0,
          totalBookings: 0,
          averageRevenue: 0
        };
        this.revenueLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[MovieManagement] Error loading revenue stats:', error);
        this.revenueStats = {
          totalRevenue: 0,
          totalBookings: 0,
          averageRevenue: 0
        };
        this.revenueLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async onSubmit() {
    if (this.movieForm.invalid) {
      this.notificationService.showError('Vui lòng điền đầy đủ thông tin hợp lệ');
      return;
    }

    // Kiểm tra quyền admin với token validation trước khi thực hiện
    const hasAccess = await this.authService.validateAdminAccess(this.router, this.notificationService);
    if (!hasAccess) {
      return;
    }

    const movieDto: MovieDTO = this.movieForm.value;
    
    // Ensure filmRating is properly formatted
    if (movieDto.filmRating === 'PG13') {
      movieDto.filmRating = 'PG-13';
    }
    
    this.loading = true;
    this.cdr.detectChanges();

    if (this.isEditing && this.editingMovieId) {
      // Update movie
      this.movieService.updateMovie(this.editingMovieId, movieDto, this.selectedFile || undefined).subscribe({
        next: (response) => {
          this.notificationService.showSuccess(`Phim "${movieDto.title}" đã được cập nhật thành công!`);
          this.loading = false;
          this.closeEditModal();
          // Delay loading movies to ensure modal is closed first
          setTimeout(() => {
            this.loadMovies();
          }, 100);
        },
        error: (error) => {
          console.error('[MovieManagement] Error updating movie:', error);
          
          if (error.originalError?.status === 401) {
            this.notificationService.showError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            this.authService.clearTokens();
          } else {
            this.notificationService.showError(`Lỗi khi cập nhật phim "${movieDto.title}": ${error.message || 'Vui lòng thử lại sau'}`);
          }
          
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.isAdding) {
      // Add new movie
      this.movieService.addMovie(movieDto, this.selectedFile || undefined).subscribe({
        next: (response: any) => {
          this.notificationService.showSuccess(`Phim "${movieDto.title}" đã được thêm thành công!`);
          this.loading = false;
          this.closeAddModal();
          // Delay loading movies to ensure modal is closed first
          setTimeout(() => {
            this.loadMovies();
          }, 100);
        },
        error: (error: any) => {
          console.error('[MovieManagement] Error creating movie:', error);
          
          if (error.originalError?.status === 401) {
            this.notificationService.showError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            this.authService.clearTokens();
          } else {
            this.notificationService.showError(`Lỗi khi thêm phim "${movieDto.title}": ${error.message || 'Vui lòng thử lại sau'}`);
          }
          
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  editMovie(movie: Movie) {
    this.isEditing = true;
    this.isAdding = false;
    this.editingMovieId = movie.id || null;
    this.selectedFile = null;
    
    // Populate form with movie data
    this.movieForm.patchValue({
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      genre: movie.genre,
      director: movie.director,
      cast: movie.cast,
      rating: movie.rating,
      status: movie.status,
      filmRating: movie.filmRating,
      price: movie.price
    });
    
    this.notificationService.showInfo(`Bắt đầu chỉnh sửa phim "${movie.title}"`);
    this.cdr.detectChanges();
  }

  async deleteMovie(movieId: number) {
    // Kiểm tra quyền admin với token validation trước khi xóa
    const hasAccess = await this.authService.validateAdminAccess(this.router, this.notificationService);
    if (!hasAccess) {
      return;
    }

    // Tìm tên phim để hiển thị trong thông báo
    const movieToDelete = this.movies.find(movie => movie.id === movieId);
    const movieTitle = movieToDelete?.title || 'Phim này';

    if (confirm(`Bạn có chắc chắn muốn xóa phim "${movieTitle}"?`)) {
      this.moviesLoading = true;
      this.cdr.detectChanges();
      
      this.movieService.deleteMovie(movieId).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Phim "${movieTitle}" đã được xóa thành công!`);
          this.loadMovies();
        },
        error: (error) => {
          console.error('[MovieManagement] Error deleting movie:', error);
          
          if (error.originalError?.status === 401) {
            this.notificationService.showError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            this.authService.clearTokens();
          } else {
            this.notificationService.showError(`Lỗi khi xóa phim "${movieTitle}": ${error.message || 'Vui lòng thử lại sau'}`);
          }
          
          this.moviesLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  resetForm() {
    // This method is specifically for starting to add a new movie
    this.isEditing = false;
    this.isAdding = true; // Show add form when reset is called
    this.editingMovieId = null;
    this.selectedFile = null;
    this.movieForm.reset({
      status: 'NOW_SHOWING',
      filmRating: 'PG-13'
    });
    this.notificationService.showInfo('Bắt đầu thêm phim mới');
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.isEditing = false;
    this.isAdding = false;
    this.editingMovieId = null;
    this.selectedFile = null;
    this.movieForm.reset({
      status: 'NOW_SHOWING',
      filmRating: 'PG-13'
    });
    this.notificationService.showInfo('Đã hủy thao tác');
    this.cdr.detectChanges();
  }

  closeEditModal() {
    this.isEditing = false;
    this.isAdding = false;
    this.editingMovieId = null;
    this.selectedFile = null;
    this.movieForm.reset({
      status: 'NOW_SHOWING',
      filmRating: 'PG-13'
    });
    this.cdr.detectChanges();
  }

  closeAddModal() {
    this.isEditing = false;
    this.isAdding = false;
    this.editingMovieId = null;
    this.selectedFile = null;
    this.movieForm.reset({
      status: 'NOW_SHOWING',
      filmRating: 'PG-13'
    });
    this.cdr.detectChanges();
  }

  showMovieList() {
    this.isEditing = false;
    this.isAdding = false;
    this.editingMovieId = null;
    this.selectedFile = null;
    this.movieForm.reset({
      status: 'NOW_SHOWING',
      filmRating: 'PG-13'
    });
    this.notificationService.showInfo('Hiển thị danh sách phim');
    this.cdr.detectChanges();
  }

  forceRefresh() {
    this.moviesLoading = true;
    this.cdr.detectChanges();
    
    // Show refresh notification
    this.notificationService.showInfo('Đang làm mới dữ liệu...');
    
    // Reload both movies and revenue stats
    this.loadMovies();
    this.loadRevenueStats();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.notificationService.showInfo(`Chuyển đến trang ${this.currentPage + 1}`);
      this.loadMovies();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.notificationService.showInfo(`Chuyển đến trang ${this.currentPage + 1}`);
      this.loadMovies();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.notificationService.showInfo(`Chuyển đến trang ${page + 1}`);
    this.loadMovies();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'NOW_SHOWING':
        return 'status-now-showing';
      case 'COMING_SOON':
        return 'status-coming-soon';
      case 'ENDED':
        return 'status-ended';
      default:
        return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'NOW_SHOWING':
        return 'Đang chiếu';
      case 'COMING_SOON':
        return 'Sắp chiếu';
      case 'ENDED':
        return 'Đã kết thúc';
      default:
        return status;
    }
  }

  getRatingBadgeClass(rating: number): string {
    if (rating >= 8) return 'rating-excellent';
    if (rating >= 7) return 'rating-good';
    if (rating >= 6) return 'rating-average';
    return 'rating-poor';
  }
}
