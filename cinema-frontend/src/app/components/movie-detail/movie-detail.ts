import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie';
import { Notification, NotificationComponent } from '../shared/notification/notification';
import { UserService } from '../../services/user'; // Import UserService

@Component({
  selector: 'app-movie-detail',
  imports: [RouterModule, CommonModule, NotificationComponent],
  templateUrl: './movie-detail.html',
  styleUrls: ['./movie-detail.scss']
})
export class MovieDetail implements OnInit {
  movie: Movie | null = null;
  error = '';
  selectedDate: string = '';
  showtimes: any[] = [];
  dates: string[] = [];
  cinemas: any[] = [];
  selectedCinema: any = null;
  notifications: Notification[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private ngZone: NgZone,
    private userService: UserService, // Inject UserService
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Cuộn lên đầu trang mỗi khi vào chi tiết phim
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.route.params.subscribe(params => {
      const movieId = params['id'];
      const parsedId = parseInt(movieId, 10);
      if (movieId && !isNaN(parsedId)) {
        this.loadMovieDetail(parsedId);
      } else {
        this.movie = null;
        this.error = 'Không tìm thấy phim';
      }
    });
  }

  loadMovieDetail(movieId: number) {
    this.error = '';
    this.movieService.getMovieDetail(movieId).subscribe({
      next: (movie) => {
        this.ngZone.run(() => {
          if (!movie || !movie.id) {
            this.movie = null;
            this.error = 'Không tìm thấy phim';
            this.cdr.detectChanges();
            return;
          }
          this.movie = movie;
          this.generateDates();
          // Load cinemas sau khi movie load thành công
          if (movie && movie.status === 'NOW_SHOWING') {
            this.loadCinemas();
          }
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.movie = null;
          this.error = 'Không thể tải thông tin phim. Vui lòng thử lại.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadCinemas() {
    this.movieService.getCinemas().subscribe({
      next: (cinemas) => {
        this.ngZone.run(() => {
          this.cinemas = cinemas;
          if (cinemas.length > 0) {
            this.selectedCinema = cinemas[0];
            this.loadShowtimes();
          }
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error loading cinemas:', error);
          // Comment out notification để tránh lỗi
          // this.showNotification('error', 'Không thể tải danh sách rạp chiếu');
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadShowtimes() {
    if (!this.movie || !this.selectedCinema || !this.movie.id) return;
    this.movieService.getMovieShowtimes(this.movie.id).subscribe({
      next: (showtimes) => {
        this.ngZone.run(() => {
          // Nếu dữ liệu không phải mảng, bỏ qua
          if (!Array.isArray(showtimes)) {
            this.showtimes = [];
            this.cdr.detectChanges();
            return;
          }
          // Lọc showtimes theo rạp đã chọn
          this.showtimes = showtimes.filter((showtime: any) => 
            showtime.room?.cinema?.id === this.selectedCinema.id
          );
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.showtimes = [];
          console.error('Error loading showtimes:', error);
          this.cdr.detectChanges();
        });
      }
    });
  }

  generateDates() {
    const today = new Date();
    this.dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      this.dates.push(date.toISOString().split('T')[0]);
    }
    this.selectedDate = this.dates[0];
  }

  selectDate(date: string) {
    this.selectedDate = date;
  }

  selectCinema(cinema: any) {
    this.selectedCinema = cinema;
    this.loadShowtimes();
  }

  bookTicket(showtime: any) {
    if (!showtime.available) return;

    // Show loading state
    const button = document.querySelector('.book-ticket-button') as HTMLElement;
    if (button) {
      button.textContent = 'Đang tải...';
      button.setAttribute('disabled', 'true');
    }

    this.router.navigate(['/booking'], {
      queryParams: {
        movieId: this.movie?.id,
        showtimeId: showtime.id,
        date: this.selectedDate,
        cinemaId: this.selectedCinema?.id
      }
    }).then(() => {
      // Restore button state
      if (button) {
        button.textContent = 'Đặt vé';
        button.removeAttribute('disabled');
      }
    }).catch((error) => {
      console.error('Navigation error:', error);
      if (button) {
        button.textContent = 'Đặt vé';
        button.removeAttribute('disabled');
      }
      this.showNotification('error', 'Có lỗi xảy ra khi điều hướng đến trang đặt vé.');
    });
  }

  goBack() {
    this.router.navigate(['/movies']);
  }

  showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    if (!type || !message) return;
    const notification: Notification = {
      type,
      message,
      duration: 5000
    };
    this.notifications.push(notification);
  }

  closeNotification(index: number) {
    this.notifications.splice(index, 1);
  }

    bookNow() {
  if (this.movie && this.movie.id) {
    const button = document.querySelector('.book-now-button') as HTMLElement;
    if (button) {
      button.textContent = 'Đang tải...';
      button.setAttribute('disabled', 'true');
    }
    this.router.navigate(['/booking'], {
      queryParams: { movieId: this.movie.id }
    }).then(() => {
      if (button) {
        button.textContent = 'Đặt vé ngay';
        button.removeAttribute('disabled');
      }
    }).catch((error) => {
      if (button) {
        button.textContent = 'Đặt vé ngay';
        button.removeAttribute('disabled');
      }
      this.showNotification('error', 'Có lỗi xảy ra khi điều hướng đến trang đặt vé.');
    });
  }
}

  setReminder() {
    if (this.movie) {
      this.showNotification('info', `Đã đặt nhắc nhở cho phim "${this.movie.title}" khi có lịch chiếu!`);
    }
  }
}
