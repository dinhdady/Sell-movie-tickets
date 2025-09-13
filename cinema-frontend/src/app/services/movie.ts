import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Movie, MovieDTO } from '../models/movie';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:8080/api/movie';

  constructor(private http: HttpClient) {}

  // Lấy danh sách phim
  getMovies(): Observable<Movie[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
        map(response => response.movies || response.object || []),
        catchError(this.handleError<Movie[]>('getMovies', []))
    );
  }

  // Lấy chi tiết phim
  getMovieDetail(movieId: number): Observable<Movie> {
    return this.http.get<any>(`${this.apiUrl}/${movieId}`).pipe(
        map(response => response.object || null),
        catchError(this.handleError<Movie>(`getMovieDetail id=${movieId}`, undefined))
    );
  }

  // Tạo phim mới
  createMovie(movie: MovieDTO): Observable<any> {
    const formData = new FormData();
    Object.keys(movie).forEach(key => {
        if (key === 'posterFile' || key === 'bannerFile') {
            if (movie[key]) {
                formData.append(key, movie[key]);
            }
        } else if (movie[key] !== null && movie[key] !== undefined) {
            formData.append(key, String(movie[key]));
        }
    });
    return this.http.post<any>(`${this.apiUrl}/add`, formData).pipe(
        catchError(this.handleError<any>('createMovie'))
    );
  }

  // Cập nhật phim
  updateMovie(movieId: number, movie: MovieDTO, posterFile?: File): Observable<any> {
      const formData = new FormData();
      Object.keys(movie).forEach(key => {
          formData.append(key, movie[key]);
      });
      if (posterFile) formData.append('posterFile', posterFile);
      return this.http.put<any>(`${this.apiUrl}/${movieId}`, formData).pipe(
          catchError(this.handleError<any>(`updateMovie id=${movieId}`))
      );
  }

  // Xóa phim
  deleteMovie(movieId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${movieId}`).pipe(
        catchError(this.handleError<any>(`deleteMovie id=${movieId}`))
    );
  }

  // Lấy lịch chiếu của phim
  getMovieShowtimes(movieId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/${movieId}/showtimes`).pipe(
      map(res => res.object || res.data || []),
      tap(data => console.log(`[MovieService] Fetched showtimes for movie ${movieId}:`, data)),
      catchError(this.handleError<any[]>(`getMovieShowtimes id=${movieId}`, []))
    );
  }

  getShowtimeById(showtimeId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/showtimes/${showtimeId}`).pipe(
      tap(data => console.log(`[MovieService] Fetched showtime ${showtimeId}:`, data)),
      catchError(this.handleError<any>(`getShowtimeById id=${showtimeId}`, null))
    );
  }

  // Lấy tất cả phim với phân trang
  getAllMovies(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
      tap(data => console.log(`[MovieService] getAllMovies page=${page} size=${size}:`, data)),
      catchError(this.handleError<any>('getAllMovies', []))
    );
  }

  // Thêm phim mới
  addMovie(movieDto: MovieDTO, posterFile?: File): Observable<any> {
    const formData = new FormData();
    Object.keys(movieDto).forEach(key => {
      formData.append(key, movieDto[key]);
    });
    if (posterFile) formData.append('posterFile', posterFile);
    return this.http.post<any>(`${this.apiUrl}/add`, formData).pipe(
      tap(data => console.log('[MovieService] addMovie:', data)),
      catchError(this.handleError<any>('addMovie'))
    );
  }

  // Lấy phim đang chiếu
  getNowShowingMovies(): Observable<Movie[]> {
    return this.http.get<any>(`${this.apiUrl}/now-showing`).pipe(
      tap(data => console.log('[MovieService] getNowShowingMovies:', data)),
      catchError(this.handleError<any>('getNowShowingMovies', []))
    );
  }

  // Lấy phim sắp chiếu
  getComingSoonMovies(): Observable<Movie[]> {
    return this.http.get<any>(`${this.apiUrl}/coming-soon`).pipe(
      tap(data => console.log('[MovieService] getComingSoonMovies:', data)),
      catchError(this.handleError<any>('getComingSoonMovies', []))
    );
  }

  // Lấy phim theo danh mục
  getMoviesByCategory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-category`).pipe(
      tap(data => console.log('[MovieService] getMoviesByCategory:', data)),
      catchError(this.handleError<any>('getMoviesByCategory', {}))
    );
  }

  // Lấy danh sách rạp chiếu
  getCinemas(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/cinema`).pipe(
      tap(data => console.log('[MovieService] getCinemas:', data)),
      catchError(this.handleError<any[]>('getCinemas', []))
    );
  }

  // Lấy tổng doanh thu
  getTotalRevenue(): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/dashboard/revenue-analytics`).pipe(
      tap(data => console.log('[MovieService] getTotalRevenue:', data)),
      catchError(this.handleError<any>('getTotalRevenue', {}))
    );
  }

  // Hàm xử lý lỗi chung
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`[MovieService] ${operation} failed:`, error);
      
      // Nếu là lỗi 401, không trả về kết quả rỗng mà để interceptor xử lý
      if (error.status === 401) {
        console.log(`[MovieService] ${operation} 401 error, letting interceptor handle it`);
        return throwError(() => error);
      }
      
      // Trả về một kết quả rỗng để ứng dụng tiếp tục chạy cho các lỗi khác
      return of(result as T);
    };
  }
}
