import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { MovieList } from './components/movie-list/movie-list';
import { MovieDetail } from './components/movie-detail/movie-detail';
import { Booking } from './components/booking/booking';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';
import { ResetPassword } from './components/auth/reset-password';
import { Payment } from './components/payment/payment';
import { Dashboard } from './components/admin/dashboard/dashboard';
import { MovieManagement } from './components/admin/movie-management/movie-management';
import { BookingManagementComponent } from './components/admin/booking-management/booking-management';
import { AdminGuard } from './services/admin.guard';
import { PaymentCallbackComponent } from './components/payment/payment-callback';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'movies', component: MovieList },
  { path: 'movies/:id', component: MovieDetail },
  { path: 'booking', component: Booking },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'payment', component: Payment },
  { path: 'payment/callback', component: PaymentCallbackComponent },
  { path: 'payment-callback', component: PaymentCallbackComponent },
  { path: 'admin/dashboard', component: Dashboard, canActivate: [AdminGuard] },
  { path: 'admin/movie-management', component: MovieManagement, canActivate: [AdminGuard] },
  { path: 'admin/booking-management', component: BookingManagementComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];
