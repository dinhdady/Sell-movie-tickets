import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie';
import { BookingService } from '../../services/booking';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { PaymentService } from '../../services/payment';
import { SeatService } from '../../services/seat.service';
import { AuthService } from '../../services/auth';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, shareReplay, startWith, filter } from 'rxjs/operators';
import { take } from 'rxjs/operators';

interface Showtime {
  id: number;
  startTime: string;
  endTime: string;
  room: {
    id: number;
    name: string;
    cinema: {
      id: number;
      name: string;
    }
  }
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss'],
  imports: [CommonModule, FormsModule]
})
export class Booking implements OnInit, OnDestroy {
  // UI state as BehaviorSubjects/Observables for template
  step$ = new BehaviorSubject<number>(1);
  selectedCinema$ = new BehaviorSubject<any | null>(null);
  selectedDate$ = new BehaviorSubject<Date | null>(null);
  selectedShowtime$ = new BehaviorSubject<any | null>(null);
  selectedRoom$: Observable<any | null> = this.selectedShowtime$.pipe(
    map(showtime => showtime?.room || null)
  );
  selectedCinemaInfo$: Observable<any | null> = this.selectedShowtime$.pipe(
    map(showtime => showtime?.room?.cinema || null)
  );
  seats$ = new BehaviorSubject<any[][]>([]);
  selectedSeats$ = new BehaviorSubject<any[]>([]);
  bookingInfo$ = new BehaviorSubject<any>({ customerName: '', customerEmail: '', customerPhone: '', customerAddress: '' });

  // Derived Observables (initialized after constructor)
  filteredShowtimes$: Observable<any[]>;

  // Add a public getter for filteredShowtimes$ to use in template if needed
  getFilteredShowtimes(): Observable<any[]> {
    return this.filteredShowtimes$;
  }
  selectedSeatNames$!: Observable<string[]>;
  totalPrice$!: Observable<number>;
  canProceed$!: Observable<boolean>;
  isBookingInfoValid$!: Observable<boolean>;
  // State as Observable
  movieId$ = new BehaviorSubject<number | null>(null);
  showtimeId$ = new BehaviorSubject<number | null>(null);
  movie$: Observable<any>;
  cinemas$: Observable<any[]>;
  showtimes$: Observable<any[]>;
  dates$: Observable<Date[]>;
  // UI stat

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private bookingService: BookingService,
    private userService: UserService,
    private paymentService: PaymentService,
    private seatService: SeatService,
    private authService: AuthService
  ) {
    // Move Observable initializations here to ensure services are available
    this.movie$ = this.movieId$.pipe(
      filter((id): id is number => !!id),
      switchMap(id => this.movieService.getMovieDetail(id)),
      shareReplay(1)
    );
    this.cinemas$ = this.movieService.getCinemas().pipe(shareReplay(1));
    this.showtimes$ = this.movieId$.pipe(
      filter((id): id is number => !!id),
      switchMap(id => this.movieService.getMovieShowtimes(id)),
      shareReplay(1)
    );
    this.dates$ = this.showtimes$.pipe(
      map(showtimes => {
        const uniqueDates = new Set<number>();
        (showtimes || []).forEach((s: any) => {
          if (s && s.startTime) {
            const date = new Date(s.startTime);
            if (!isNaN(date.getTime())) {
              const normalizedDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
              uniqueDates.add(normalizedDate);
            }
          }
        });
        return Array.from(uniqueDates).map(ts => new Date(ts));
      })
    );

    // Derived Observables (must be initialized after showtimes$ etc.)
  this.filteredShowtimes$ = combineLatest([
  this.showtimes$,
  this.selectedCinema$,
  this.selectedDate$
]).pipe(
  map(([showtimes, cinema, date]) => {
    if (!showtimes || showtimes.length === 0) return [];

    let filtered = showtimes;

    // Filter by cinema if selected
    if (cinema) {
      filtered = filtered.filter((s: any) => s.room?.cinema?.id === cinema.id);
    }

    // Filter by date if selected
    if (date) {
      filtered = filtered.filter((s: any) => {
        const showtimeDate = new Date(s.startTime);

        // Normalize both dates to local midnight for comparison
        const showtimeDay = new Date(
          showtimeDate.getFullYear(),
          showtimeDate.getMonth(),
          showtimeDate.getDate()
        ).getTime();

        const selectedDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).getTime();

        return showtimeDay === selectedDay;
      });
    }

    return filtered;
  })
);
    this.selectedSeatNames$ = this.selectedSeats$.pipe(
      map(seats => (seats || []).map((s: any) => s.seatNumber))
    );
    // Trong phần khởi tạo totalPrice$
this.totalPrice$ = combineLatest([
  this.selectedSeats$,
  this.selectedShowtime$,
  this.movie$
]).pipe(
  map(([seats, showtime, movie]) => {
    if (!seats || seats.length === 0) return 0;
    
    // Ưu tiên sử dụng giá từ showtime, nếu không có thì dùng giá từ movie
    const pricePerSeat = showtime?.price || movie?.price || 0;
    return seats.length * pricePerSeat;
  })
);
    this.canProceed$ = this.selectedSeats$.pipe(
      map(seats => Array.isArray(seats) && seats.length > 0)
    );
    this.isBookingInfoValid$ = this.bookingInfo$.pipe(
      map(info => !!(info.customerName && info.customerEmail && info.customerPhone))
    );
  }

  getRowLabel(i: number): string {
    return String.fromCharCode(65 + i);
  }

  ngOnInit() {
    window.scrollTo({ top: 0 });
    this.route.queryParams.subscribe(params => {
      const movieId = parseInt(params['movieId'], 10);
      const showtimeId = parseInt(params['showtimeId'], 10);
      if (!movieId || isNaN(movieId)) {
        // Legacy: this.error = ...
        return;
      }
      this.movieId$.next(movieId);
      if (showtimeId && !isNaN(showtimeId)) this.showtimeId$.next(showtimeId);
    });
  }

  ngOnDestroy() {}

  reloadOnFocus = () => {
    const params = this.route.snapshot.queryParams;
    const movieId = parseInt(params['movieId'], 10);
    const showtimeId = parseInt(params['showtimeId'], 10);
    if (movieId && !isNaN(movieId)) {
      this.loadBookingData(movieId, showtimeId);
    }
  };

  reloadOnClick = (event: any) => {
    // Chỉ reload nếu click vào vùng chính của booking (tránh reload khi click vào nút nhỏ)
    if (event && event.target && event.target.classList && event.target.classList.contains('booking')) {
      const params = this.route.snapshot.queryParams;
      const movieId = parseInt(params['movieId'], 10);
      const showtimeId = parseInt(params['showtimeId'], 10);
      if (movieId && !isNaN(movieId)) {
        this.loadBookingData(movieId, showtimeId);
      }
    }
  };

  loadBookingData(movieId: number, showtimeId?: number) {
    // Lấy email user nếu đã đăng nhập
  // Legacy user info logic removed. Use Observable-based user state if needed.
    this.loadMovie(movieId);
    this.loadInitialData(movieId);
    if (showtimeId) {
      this.loadShowtimeDetails(showtimeId);
    }
  }

  loadMovie(movieId: number) {
  // Legacy imperative code removed. Use movie$ Observable for movie detail.
  }

  loadShowtimeDetails(showtimeId: number) {
    // Lấy chi tiết suất chiếu theo showtimeId
    this.movieService.getShowtimeById(showtimeId).subscribe(showtime => {
      if (showtime) {
        this.selectedShowtime$.next(showtime);
        if (showtime.room) {
          this.selectedCinema$.next(showtime.room.cinema);
          // Set selectedDate$ based on showtime startTime date
          if (showtime.startTime) {
            const date = new Date(showtime.startTime);
            const normalizedDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            this.selectedDate$.next(normalizedDate);
          }
          // Load seats for the room
          this.seatService.getSeatsByRoom(showtime.room.id).subscribe(seats => {
            this.seats$.next(this.mapSeatsToGrid(seats));
            this.selectedSeats$.next([]);
          });
        }
      }
    });
  }

  loadInitialData(movieId: number) {
    // Tải danh sách rạp
  // Legacy imperative code removed. Use cinemas$ Observable for cinemas.
  }

  generateSeatMap() {
    // This function can be removed if seats are always loaded from the service
  }

  isSeatBooked(seat: any): boolean {
    // Nếu bookedSeats là mảng string seatNumber, so sánh với seat.seatNumber
  // bookedSeats$ là Observable, kiểm tra trong template bằng async pipe
  return seat.status !== 'AVAILABLE';
  }

  isSeatSelected(seat: any): boolean {
    const selected = this.selectedSeats$.getValue();
    return selected.some((s: any) => s.id === seat.id);
  }

  toggleSeat(seat: any) {
    const current = this.selectedSeats$.getValue();
    const idx = current.findIndex((s: any) => s.id === seat.id);
    if (idx > -1) {
      this.selectedSeats$.next(current.filter((s: any) => s.id !== seat.id));
    } else {
      this.selectedSeats$.next([...current, seat]);
    }
  }

  getTotalPrice(): number {
  // Tính toán trong template bằng async pipe
  return 0;
  }

    bookTickets() {
  // Đã chuyển sang dùng Observable, xử lý đặt vé qua service và cập nhật state qua BehaviorSubject nếu cần
    }

  showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
  if (!type || !message) return;
  // Notification logic should be handled by NotificationService or similar.
  }

  closeNotification(index: number) {
  // Legacy notification array removed.
  }

  goBack() {
    this.router.navigate(['/']); // Or use: window.history.back();
  }

  // Add missing methods for template
  selectCinema(cinema: any) {
  this.selectedCinema$.next(cinema);
  this.selectedDate$.next(null);
  this.selectedShowtime$.next(null);
  this.seats$.next([]);
  this.selectedSeats$.next([]);
  }

  // Hàm chuyển danh sách ghế thành mảng 2 chiều mô phỏng vị trí ghế
  mapSeatsToGrid(seats: any[]): any[][] {
    if (!seats || seats.length === 0) return [];
    // Gom ghế theo row, sort theo column
    const rowMap: {[row: string]: any[]} = {};
    seats.forEach(seat => {
      if (!rowMap[seat.rowNumber]) rowMap[seat.rowNumber] = [];
      rowMap[seat.rowNumber].push(seat);
    });
    // Sắp xếp các row theo alphabet, các ghế trong row theo columnNumber
    const sortedRows = Object.keys(rowMap).sort();
    return sortedRows.map(row => rowMap[row].sort((a, b) => a.columnNumber - b.columnNumber));
  }

  selectDate(date: Date) {
  // Sửa: Tạo date mới với cùng ngày, tháng, năm nhưng bỏ qua giờ phút
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  this.selectedDate$.next(normalizedDate);
  this.selectedShowtime$.next(null);
  this.seats$.next([]);
  this.selectedSeats$.next([]);
}

  selectShowtime(showtime: any) {
    this.selectedShowtime$.next(showtime); // Store full showtime object
    if (showtime && showtime.room && showtime.room.id) {
      this.seatService.getSeatsByRoom(showtime.room.id).subscribe(seats => {
        this.seats$.next(this.mapSeatsToGrid(seats));
        this.selectedSeats$.next([]);
      });
    } else {
      this.seats$.next([]);
      this.selectedSeats$.next([]);
    }
  }

  canProceed(): boolean {
    // Example: require at least one seat selected
  // Use Observable-based selection for canProceed.
  return this.selectedSeatNames.length > 0;
  }

  nextStep() {
  const step = this.step$.getValue();
  if (step < 3) this.step$.next(step + 1);
  }

  prevStep() {
  const step = this.step$.getValue();
  if (step > 1) this.step$.next(step - 1);
  }

  isBookingInfoValid(): boolean {
  // Dùng isBookingInfoValid$ trong template
  return true;
  }

  updateBookingInfo(field: string, value: any) {
    const info = { ...this.bookingInfo$.getValue(), [field]: value };
    this.bookingInfo$.next(info);
  }


  proceedToPayment() {
  // Sử dụng combineLatest để đảm bảo tất cả giá trị đều có
  combineLatest([
    this.selectedSeats$,
    this.selectedShowtime$,
    this.bookingInfo$,
    this.selectedPaymentMethod$,
    this.movie$
  ]).pipe(
    take(1)
  ).subscribe({
    next: ([selectedSeats, selectedShowtime, bookingInfo, paymentMethod, movie]) => {
      
      if (!selectedSeats || selectedSeats.length === 0) {
        this.showNotification('error', 'Vui lòng chọn ít nhất một ghế');
        return;
      }
      
      if (!selectedShowtime) {
        this.showNotification('error', 'Vui lòng chọn suất chiếu');
        return;
      }
      
      if (!bookingInfo.customerName || !bookingInfo.customerEmail || !bookingInfo.customerPhone) {
        this.showNotification('error', 'Vui lòng điền đầy đủ thông tin khách hàng');
        return;
      }
      
      // Tính tổng tiền
      const totalAmount = selectedSeats.length * (selectedShowtime.price || movie?.price || 0);
      
      this.processPayment(paymentMethod, totalAmount, selectedShowtime.id, selectedSeats);
    },
    error: (error) => {
      console.error('Error in proceedToPayment:', error);
      this.showNotification('error', 'Có lỗi xảy ra khi xử lý thanh toán');
    }
  });
}
selectedPaymentMethod$ = new BehaviorSubject<string>('vnpay');

// Thêm method để cập nhật
selectPaymentMethod(method: string) {
  this.selectedPaymentMethod$.next(method);
}
getPaymentIcon(method: string): string {
  switch(method) {
    case 'vnpay': return 'fas fa-credit-card';
    case 'momo': return 'fas fa-mobile-alt';
    case 'cash': return 'fas fa-money-bill-wave';
    default: return 'fas fa-credit-card';
  }
}

getPaymentLabel(method: string): string {
  switch(method) {
    case 'vnpay': return 'VNPay';
    case 'momo': return 'MoMo';
    case 'cash': return 'Tiền mặt';
    default: return method;
  }
}
private processPayment(method: string, amount: number, showtimeId: number, seats: any[]): void {
  console.log('[processPayment]', { method, amount, showtimeId, seats });
  
  this.userService.getCurrentUser().pipe(
    take(1),
    switchMap((user: any) => {
      // Xử lý cấu trúc user response - điều chỉnh theo API thực tế
      let userId: any;
      if (user && user.id) {
        userId = user.id;
      } else if (user && user.object && user.object.id) {
        userId = user.object.id;
      } else {
        throw new Error('Không xác định được người dùng');
      }
      
      const bookingInfo = this.bookingInfo$.getValue();
      const bookingData = {
        userId: userId,
        showtimeId: showtimeId,
        seatIds: seats.map(seat => seat.id),
        customerName: bookingInfo.customerName,
        customerEmail: bookingInfo.customerEmail,
        customerPhone: bookingInfo.customerPhone,
        customerAddress: bookingInfo.customerAddress || '',
        totalPrice: amount  // Fixed: changed totalAmount to totalPrice to match backend DTO
      };
      
      console.log('[processPayment] bookingData', bookingData);
      return this.bookingService.createBooking(bookingData);
    }),
    take(1)
  ).subscribe({
    next: (bookingResponse: any) => {
      console.log('[processPayment] bookingResponse', bookingResponse);
      
      // Điều chỉnh theo cấu trúc response thực tế của API
      const bookingId = bookingResponse.id || bookingResponse.object?.id || bookingResponse.bookingId;
      const actualAmount = bookingResponse.totalAmount || bookingResponse.amount || amount;
      
      if (!bookingId) {
        throw new Error('Không nhận được booking ID từ server');
      }
      
      if (method === 'vnpay' || method === 'momo') {
        const paymentRequest = {
          amount: Math.round(actualAmount).toString(),
          bookingId: bookingId
        };
        
        console.log('[processPayment] paymentRequest', paymentRequest);
        
        this.paymentService.createPayment(paymentRequest).pipe(take(1)).subscribe({
          next: (paymentUrl: string) => {
            if (paymentUrl) {
              window.location.href = paymentUrl;
            } else {
              this.showNotification('error', 'Không nhận được URL thanh toán');
            }
          },
          error: (error) => {
            console.error('Payment error:', error);
            this.showNotification('error', 'Có lỗi xảy ra khi tạo thanh toán');
          }
        });
      } else if (method === 'cash') {
        this.showNotification('success', 'Đặt vé thành công! Vui lòng thanh toán tiền mặt tại rạp.');
        this.router.navigate(['/booking-confirmation', bookingId]);
      }
    },
    error: (error) => {
      console.error('Booking error:', error);
      this.showNotification('error', 'Có lỗi xảy ra khi đặt vé: ' + (error.error?.message || error.message || 'Lỗi không xác định'));
    }
  });
}

  callPayment(bookingId: number, amount: number) {
  // Legacy imperative code removed. Use Observable-based payment flow.
}
  async loadCinemasAndShowtimes(movieId: number) {
    // Kiểm tra và refresh token trước khi gọi API
    const tokenValid = await this.authService.checkAndRefreshToken();
    if (!tokenValid) {
      this.showNotification('error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      this.router.navigate(['/login']);
      return;
    }

    // Load all cinemas
  // Legacy imperative code removed. Use cinemas$ and showtimes$ Observables.
  }

  get selectedSeatNames(): string[] {
  // Use Observable-based seat selection in template.
  return [];
  }



  // Đã chuyển sang dùng AuthService.checkAndRefreshToken()

  // Kiểm tra token có hết hạn không
  private isTokenExpired(token: string): boolean {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Xử lý lỗi 401
  handleUnauthorizedError(): void {
  this.showNotification('error', 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập.');
  // Không xóa token và không điều hướng về /login nữa
  // Nếu muốn xử lý khác, có thể reload trang hoặc chuyển về trang chủ:
  // this.router.navigate(['/']);
  }

  // Helper method to compare dates for template
  isSameDate(date1: Date | null, date2: Date): boolean {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}
