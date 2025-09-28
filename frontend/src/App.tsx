import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminLayout from './components/AdminLayout';
import NotificationPermission from './components/NotificationPermission';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Booking from './pages/Booking';
import BookingSuccess from './pages/BookingSuccess';
import BookingForm from './pages/BookingForm';
import PaymentCallback from './pages/PaymentCallback';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import GoogleDebug from './pages/GoogleDebug';
import Cinemas from './pages/Cinemas';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
// Admin pages
import Dashboard from './pages/admin/Dashboard';
import MovieManagement from './pages/admin/MovieManagement';
import BookingManagement from './pages/admin/BookingManagement';
import UserManagement from './pages/admin/UserManagement';
import CinemaManagement from './pages/admin/CinemaManagement';
import RoomManagement from './pages/admin/RoomManagement';
import SeatManagement from './pages/admin/SeatManagement';
import Statistics from './pages/admin/Statistics';
import Settings from './pages/admin/Settings';
import CouponManagement from './pages/admin/CouponManagement';
import EventManagement from './pages/admin/EventManagement';
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/movies/:id" element={<MovieDetail />} />
                  <Route path="/cinemas" element={<Cinemas />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/booking/:id" element={<Booking />} />
                  <Route path="/booking-form" element={<BookingForm />} />
                  <Route path="/booking-success/:id" element={<BookingSuccess />} />
                  <Route path="/payment-callback" element={<PaymentCallback />} />
                  <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
                  <Route path="/google-debug" element={<GoogleDebug />} />
                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                    <Route path="movies" element={<MovieManagement />} />
                    <Route path="bookings" element={<BookingManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="cinemas" element={<CinemaManagement />} />
                    <Route path="rooms" element={<RoomManagement />} />
                    <Route path="seats" element={<SeatManagement />} />
                    <Route path="statistics" element={<Statistics />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="coupons" element={<CouponManagement />} />
                    <Route path="events" element={<EventManagement />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <NotificationPermission />
              <PWAInstallPrompt />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
export default App;
