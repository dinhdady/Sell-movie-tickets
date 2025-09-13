import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private apiUrl = 'http://localhost:8080/api/newsletter';

  constructor(private http: HttpClient) { }

  // Đăng ký newsletter
  subscribe(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  // Hủy đăng ký newsletter
  unsubscribe(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/unsubscribe`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  // Xử lý lỗi
  private handleError(error: any) {
    console.error('Newsletter service error:', error);
    return throwError(() => error);
  }
} 