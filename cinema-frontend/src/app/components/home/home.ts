import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { NewsletterService } from '../../services/newsletter';
import { Notification, NotificationComponent } from '../shared/notification/notification';
import { Observable, Subscription, forkJoin, of, firstValueFrom } from 'rxjs';
import { filter, catchError, map, take } from 'rxjs/operators';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, NotificationComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  featuredMovies$!: Observable<Movie[]>;
  comingSoonMovies$!: Observable<Movie[]>;
  moviesByCategory$!: Observable<{[key: string]: Movie[]}>;
  genres$!: Observable<string[]>;
  loading = true;
  bookingLoading = false;
  error = '';
  notifications: Notification[] = [];
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private authStateSubscription?: Subscription;

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private userService: UserService,
    private newsletterService: NewsletterService,
    private router: Router,
    private authStateService: AuthStateService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('[Home] Component initialized');
    // Always load movies on component init
    this.loadMovies();
    this.subscribeToRouterEvents();
    this.subscribeToAuthState();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  loadMovies() {
    console.log('[Home] Loading movies...');
    this.loading = true;
    this.error = '';

    console.log('[Home] Fetching movies from API...');
    
    // Create individual observables for each data source
    const allMovies$ = this.movieService.getMovies().pipe(
      map((response) => Array.isArray(response) ? response : []), // Ensure it returns an array
      catchError(err => { 
        this.error = 'Không thể tải danh sách phim'; 
        return of([]); 
      })
    );

    const comingSoon$ = this.movieService.getComingSoonMovies().pipe(
      map((response) => Array.isArray(response) ? response.filter(m => m.status === 'COMING_SOON') : []),
      catchError(err => { 
        this.error = 'Không thể tải danh sách phim sắp chiếu'; 
        return of([]); 
      })
    );

    const byCategory$ = this.movieService.getMoviesByCategory().pipe(
      map((response) => response || {}), // Ensure it returns an object
      catchError(err => { 
        this.error = 'Không thể tải danh sách phim theo thể loại'; 
        return of({}); 
      })
    );

    // Assign observables directly
    this.featuredMovies$ = allMovies$;
    this.comingSoonMovies$ = comingSoon$;
    this.moviesByCategory$ = byCategory$;
    this.genres$ = byCategory$.pipe(map(byCat => Object.keys(byCat)));

    // Subscribe to handle loading state and errors
    forkJoin({
      allMovies: allMovies$,
      comingSoon: comingSoon$,
      byCategory: byCategory$
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
          console.log('[Home] All movies loaded successfully');
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = 'Không thể tải dữ liệu phim. Vui lòng thử lại.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Force reload movies (có thể gọi từ template)
  reloadMovies() {
    console.log('[Home] Force reloading movies...');
    this.loadMovies();
  }

  getGenreIcon(genre: string): string {
    const genreIcons: {[key: string]: string} = {
      'Action': 'fas fa-fire',
      'Adventure': 'fas fa-compass',
      'Comedy': 'fas fa-laugh',
      'Drama': 'fas fa-theater-masks',
      'Fantasy': 'fas fa-magic',
      'Horror': 'fas fa-ghost',
      'Crime': 'fas fa-user-secret',
      'Thriller': 'fas fa-exclamation-triangle',
      'Romance': 'fas fa-heart',
      'Sci-Fi': 'fas fa-rocket',
      'Animation': 'fas fa-child',
      'Documentary': 'fas fa-camera',
      'Family': 'fas fa-home',
      'Mystery': 'fas fa-search',
      'War': 'fas fa-shield-alt',
      'Western': 'fas fa-hat-cowboy',
      'Musical': 'fas fa-music',
      'Sport': 'fas fa-trophy',
      'Biography': 'fas fa-user',
      'History': 'fas fa-landmark'
    };
    return genreIcons[genre] || 'fas fa-film';
  }

  // Kiểm tra xem user đã đăng nhập chưa
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    return this.userService.getCurrentUser();
  }

  // Đăng ký newsletter
  subscribeNewsletter(email: string) {
    if (!email || !email.trim()) {
      this.showNotification('error', 'Vui lòng nhập email hợp lệ');
      return;
    }

    this.newsletterService.subscribe(email).subscribe({
      next: (response) => {
        console.log('Newsletter subscription successful:', response);
        this.showNotification('success', 'Đăng ký newsletter thành công!');
      },
      error: (error) => {
        console.error('Newsletter subscription failed:', error);
        this.showNotification('error', 'Đăng ký newsletter thất bại. Vui lòng thử lại sau.');
      }
    });
  }

  // Hiển thị thông báo
  showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    if (!type || !message) return;
    const notification: Notification = {
      type,
      message,
      duration: 5000
    };
    this.notifications.push(notification);
  }

  // Đóng thông báo
  closeNotification(index: number) {
    this.notifications.splice(index, 1);
  }

  async onBookTicketClick() {
    this.bookingLoading = true;
    try {
      const movies = await firstValueFrom(this.featuredMovies$);
      if (movies && movies.length > 0) {
        const movieId = movies[0].id;
        this.router.navigate(['/booking'], { queryParams: { movieId } });
      } else {
        this.showNotification('warning', 'Hiện chưa có phim nào để đặt vé!');
      }
    } catch (error: any) {
      this.showNotification('error', 'Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại.');
    } finally {
      this.bookingLoading = false;
    }
  }


  // Phương thức mới xử lý đặt vé, kiểm tra đăng nhập và điều hướng an toàn
  async handleBookTicket(movieId: number | undefined, event?: Event) {
    if (event) event.preventDefault();
    console.log('[handleBookTicket] Bắt đầu đặt vé với movieId:', movieId);
    // Log trạng thái token trong localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('[handleBookTicket] accessToken in localStorage:', accessToken);
    console.log('[handleBookTicket] refreshToken in localStorage:', refreshToken);
    if (movieId === undefined) {
      this.showNotification('error', 'Không tìm thấy thông tin phim. Vui lòng thử lại.');
      console.warn('[handleBookTicket] movieId is undefined');
      return;
    }
    this.bookingLoading = true;
    try {
      const isLoggedIn = this.authService.isLoggedIn();
      console.log('[handleBookTicket] isLoggedIn:', isLoggedIn);
      // Log lại trạng thái token sau khi gọi isLoggedIn
      console.log('[handleBookTicket] accessToken sau isLoggedIn:', localStorage.getItem('accessToken'));
      console.log('[handleBookTicket] refreshToken sau isLoggedIn:', localStorage.getItem('refreshToken'));
      if (!isLoggedIn) {
        this.showNotification('warning', 'Vui lòng đăng nhập để đặt vé!');
        console.warn('[handleBookTicket] User not logged in, show notification only, do not navigate.');
        // Không điều hướng nữa, chỉ thông báo
        return;
      }
      // Nếu đã đăng nhập, điều hướng đến trang booking
      console.log('[handleBookTicket] Điều hướng đến trang booking với movieId:', movieId);
      this.router.navigate(['/booking'], { queryParams: { movieId } });
    } catch (error: any) {
      this.showNotification('error', 'Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại.');
      console.error('[handleBookTicket] Error:', error);
    } finally {
      this.bookingLoading = false;
      // Log lại trạng thái token sau khi xử lý xong
      console.log('[handleBookTicket] accessToken cuối cùng:', localStorage.getItem('accessToken'));
      console.log('[handleBookTicket] refreshToken cuối cùng:', localStorage.getItem('refreshToken'));
    }
  }

  // Subscribe to router events to detect when user navigates to home
  private subscribeToRouterEvents() {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/' || event.url === '/home') {
        console.log('[Home] Reloading movies on navigation...');
        this.loadMovies();
      }
    });
  }

  // Subscribe to authentication state changes
  private subscribeToAuthState() {
    this.authStateSubscription = this.authStateService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        console.log('[Home] Auth state changed:', isAuthenticated);
        if (isAuthenticated) {
          console.log('[Home] User logged in, movies will be loaded when needed');
          // Don't automatically reload movies after login to avoid conflicts
          // Movies will be loaded when user navigates or refreshes
        }
      }
    );
  }
}
