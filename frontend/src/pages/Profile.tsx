import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, bookingAPI } from '../services/api';
import { passwordAPI } from '../services/passwordApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ChangePasswordModal from '../components/ChangePasswordModal';
import OTPVerificationModal from '../components/OTPVerificationModal';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  TicketIcon,
  CreditCardIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  QrCodeIcon,
  BuildingOfficeIcon,
  FilmIcon,
  XMarkIcon as CloseIcon,
} from '@heroicons/react/24/outline';

import '../styles/app-theme.css';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
interface Booking {
  id: number;
  userId?: string;
  showtimeId?: number;
  totalPrice: number;
  totalAmount?: number;
  status: string;
  bookingStatus?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  movie?: {
    title: string;
    posterUrl?: string;
    description?: string;
    duration?: number;
    releaseDate?: string;
    genre?: string;
    director?: string;
    cast?: string;
    rating?: number;
    language?: string;
    filmRating?: string;
    price?: number;
  };
  showtime?: {
    id?: number;
    startTime: string;
    endTime: string;
    room: {
      name: string;
      capacity?: number;
      cinema: {
        id?: number;
        name: string;
        address: string;
        phone?: string;
        cinemaType?: string;
      };
    };
    movie?: {
      title: string;
      posterUrl?: string;
    };
  };
  order?: {
    tickets: Array<{
      id: number;
      orderId: number;
      seatId: number;
      price: number;
      token: string;
      status: string;
      qrCodeUrl?: string;
      isUsed?: boolean;
      createdAt?: string;
      seat: {
        seatNumber: string;
        rowNumber: string;
        columnNumber: number;
        roomId: number;
        seatType: 'REGULAR' | 'VIP' | 'COUPLE';
        price: number;
      };
    }>;
    status: string;
    customerPhone?: string;
    customerAddress?: string;
  };
  tickets?: Array<{
    id: number;
    seat: { row: string; number: number; type: string };
    price: number;
    status: string;
    qrCodeUrl?: string;
    token?: string;
  }>;
}

const Profile: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [saveLoading, setSaveLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [showAllBookings, setShowAllBookings] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Password change states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  // Load user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profileResponse = await userAPI.getProfile();
        setUserProfile(profileResponse.object);
        setEditedProfile(profileResponse.object);
      } catch {
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    if (authUser) fetchUserProfile();
  }, [authUser]);

  // Load bookings separately
  useEffect(() => {
    const loadBookings = async () => {
      if (!authUser?.id) return;
      try {
        setBookingsLoading(true);

        // Ưu tiên sử dụng getUserBookings (endpoint chính thức)
        try {
          const bookingsResponse = await bookingAPI.getUserBookings(authUser.id);
          if (Array.isArray(bookingsResponse) && bookingsResponse.length > 0) {
            setBookings(
              bookingsResponse.sort(
                (a, b) =>
                  new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              )
            );
            return;
          }
        } catch (err) {
          console.warn('Error fetching user bookings:', err);
        }

        // Fallback: sử dụng getMyTickets
        try {
          const ticketsResponse = await bookingAPI.getMyTickets(authUser.id);
          if (Array.isArray(ticketsResponse) && ticketsResponse.length > 0) {
            setBookings(
              ticketsResponse.sort(
                (a, b) =>
                  new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              )
            );
            return;
          }
        } catch (err) {
          console.warn('Error fetching my tickets:', err);
        }

        // Nếu cả hai đều thất bại, set empty array
        setBookings([]);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    const t = setTimeout(loadBookings, 120);
    return () => clearTimeout(t);
  }, [authUser?.id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authUser?.id) handleRefreshBookings();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) setEditedProfile(userProfile || {});
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    try {
      setSaveLoading(true);
      const updateData = { ...editedProfile, role: editedProfile.role as 'USER' | 'ADMIN' };
      const response = await userAPI.updateProfile(authUser!.id, updateData);
      setUserProfile(response.object);
      updateUser(response.object);
      setEditMode(false);
      setError(null);
    } catch {
      setError('Không thể cập nhật thông tin');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

  const getStatusColor = (booking: Booking) => {
    const status = booking.paymentStatus || booking.status;
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      case 'paid':
      case 'success':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'pending':
      case 'processing':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'cancelled':
      case 'failed':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
      case 'expired':
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-700 ring-1 ring-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200';
    }
  };

  const getStatusText = (booking: Booking) => {
    const status = booking.paymentStatus || booking.status;
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'paid':
      case 'success':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
      case 'failed':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      case 'expired':
        return 'Hết hạn';
      case 'processing':
        return 'Đang xử lý';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status || 'Chờ thanh toán';
    }
  };

  const handleRefreshBookings = async () => {
    try {
      setBookingsLoading(true);
      if (!authUser?.id) {
        setBookings([]);
        return;
      }

      // Ưu tiên sử dụng getUserBookings (endpoint chính thức)
      try {
        const bookingsResponse = await bookingAPI.getUserBookings(authUser.id);
        if (Array.isArray(bookingsResponse) && bookingsResponse.length > 0) {
          setBookings(
            bookingsResponse.sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            )
          );
          return;
        }
      } catch (err) {
        console.warn('Error fetching user bookings:', err);
      }

      // Fallback: sử dụng getMyTickets
      try {
        const ticketsResponse = await bookingAPI.getMyTickets(authUser.id);
        if (Array.isArray(ticketsResponse) && ticketsResponse.length > 0) {
          setBookings(
            ticketsResponse.sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            )
          );
          return;
        }
      } catch (err) {
        console.warn('Error fetching my tickets:', err);
      }

      // Nếu cả hai đều thất bại, set empty array
      setBookings([]);
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      setError('Không thể tải lại danh sách vé');
    } finally {
      setBookingsLoading(false);
    }
  };

  // QR helpers
  const generateQRCodeData = (booking: Booking, token?: string) => `TICKET_${token || `TKT${booking.id}`}`;
  const createQRCodeUrl = (data: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;

  const handleViewBookingDetail = async (booking: Booking) => {
    try {
      try {
        const response = await bookingAPI.getDetailsById(booking.id);
        if (response.state === 'SUCCESS' && response.object) {
          const enhancedObject = { ...response.object };
          if (enhancedObject.order?.tickets?.length) {
            enhancedObject.order.tickets = enhancedObject.order.tickets.map((t: any) => {
              if (!t.qrCodeUrl && t.token) t.qrCodeUrl = createQRCodeUrl(generateQRCodeData(enhancedObject, t.token));
              return t;
            });
          }
          setSelectedBooking(enhancedObject);
          setQrCodeUrl(
            enhancedObject.order?.tickets?.[0]?.token
              ? createQRCodeUrl(`TICKET_${enhancedObject.order.tickets[0].token}`)
              : createQRCodeUrl(`TICKET_${enhancedObject.id}`)
          );
          setShowBookingDetail(true);
          return;
        }
      } catch {}

      let realToken: string | null = null;
      if (booking.order?.tickets?.length) realToken = booking.order.tickets[0].token;
      else if (booking.tickets?.length) realToken = booking.tickets[0].token || null;

      const url = realToken ? createQRCodeUrl(`TICKET_${realToken}`) : createQRCodeUrl(`TICKET_${booking.id}`);
      setQrCodeUrl(url);

      setSelectedBooking({
        ...booking,
        order: booking.order || {
          id: booking.id,
          status: booking.paymentStatus || booking.status || 'PAID',
          totalPrice: booking.totalPrice,
          customerEmail: booking.customerEmail,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone || 'Chưa cập nhật',
          customerAddress: booking.customerAddress || 'Chưa cập nhật',
          tickets: booking.tickets || [],
        },
      });
      setShowBookingDetail(true);
    } catch {
      setSelectedBooking(booking);
      setQrCodeUrl(createQRCodeUrl(`TICKET_${booking.id}`));
      setShowBookingDetail(true);
    }
  };

  const handleCloseBookingDetail = () => {
    setShowBookingDetail(false);
    setSelectedBooking(null);
  };

  const handleViewMore = () => setShowAllBookings(!showAllBookings);

  // Password change handlers
  const handlePasswordChangeRequest = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await passwordAPI.requestPasswordChange({ oldPassword, newPassword });
      if (response.otpSent) {
        setOtpEmail(response.email);
        setShowChangePasswordModal(false);
        setShowOTPModal(true);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể gửi yêu cầu đổi mật khẩu');
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      await passwordAPI.verifyOTPAndChangePassword({ otp });
      setShowOTPModal(false);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP không hợp lệ');
    }
  };

  const handleResendOTP = async () => {
    try {
      await passwordAPI.resendOTP();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể gửi lại OTP');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!userProfile) {
    return (
      <div className="min-h-screen grid place-items-center app-page">
        <div className="card p-6 max-w-md w-full text-center">
          <div className="text-rose-600 font-bold text-lg mb-3">Không thể tải thông tin người dùng</div>
          <button onClick={() => window.location.reload()} className="btn btn-primary px-4 py-2 w-full">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const paidCount = bookings.filter((b) => (b.status || '').toLowerCase() === 'paid').length;

  return (
    <div className="min-h-screen app-page py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Tài khoản</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin cá nhân, bảo mật và lịch sử đặt vé.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Profile */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Thông tin tài khoản</h2>
                  <p className="text-sm text-slate-500 mt-1">Cập nhật họ tên và số điện thoại của bạn.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={editMode ? handleSave : handleEditToggle}
                    disabled={saveLoading}
                    className={`btn px-4 py-2 inline-flex items-center gap-2 ${
                      editMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'btn-primary'
                    } disabled:opacity-60`}
                  >
                    {saveLoading ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white" />
                    ) : editMode ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <PencilIcon className="h-4 w-4" />
                    )}
                    {editMode ? 'Lưu' : 'Chỉnh sửa'}
                  </button>

                  {editMode && (
                    <button onClick={handleEditToggle} className="btn btn-ghost px-3 py-2 inline-flex items-center gap-2">
                      <XMarkIcon className="h-4 w-4" />
                      Hủy
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <Field
                  icon={<UserIcon className="h-4 w-4" />}
                  label="Họ và tên"
                  value={userProfile.fullName}
                  editMode={editMode}
                >
                  <input
                    className="input"
                    value={editedProfile.fullName || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                  />
                </Field>

                {/* Username */}
                <Field icon={<UserIcon className="h-4 w-4" />} label="Tên đăng nhập" value={userProfile.username} />

                {/* Email */}
                <Field icon={<EnvelopeIcon className="h-4 w-4" />} label="Email" value={userProfile.email} />

                {/* Phone */}
                <Field
                  icon={<PhoneIcon className="h-4 w-4" />}
                  label="Số điện thoại"
                  value={userProfile.phone || 'Chưa cập nhật'}
                  editMode={editMode}
                >
                  <input
                    className="input"
                    value={editedProfile.phone || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </Field>

                {/* Join Date */}
                <Field icon={<CalendarIcon className="h-4 w-4" />} label="Ngày tham gia" value={formatDate(userProfile.createdAt)} />

                {/* Role */}
                <div className="sm:col-span-1">
                  <div className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                    <CreditCardIcon className="h-4 w-4 text-slate-500" />
                    Loại tài khoản
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span
                      className={`badge ${
                        userProfile.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                          : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                      }`}
                    >
                      {userProfile.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Thống kê</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard title="Vé đã đặt" value={bookings.length} tone="indigo" />
                <StatCard title="Đã thanh toán" value={paidCount} tone="emerald" />
              </div>
            </div>

            {/* Security */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Bảo mật</h2>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">Mật khẩu</p>
                    <p className="text-sm text-slate-500">Đổi mật khẩu để bảo vệ tài khoản.</p>
                  </div>
                  <button onClick={() => setShowChangePasswordModal(true)} className="btn btn-ghost px-4 py-2">
                    Đổi mật khẩu
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">Xác thực hai bước</p>
                    <p className="text-sm text-slate-500">Bảo vệ tài khoản tốt hơn (tuỳ chọn).</p>
                  </div>
                  <button className="btn btn-ghost px-4 py-2">Kích hoạt</button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">Thông báo email</p>
                    <p className="text-sm text-slate-500">Nhận thông báo đơn hàng qua email.</p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Booking history */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
                    <TicketIcon className="h-5 w-5 text-slate-500" />
                    Lịch sử đặt vé
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{bookings.length} vé đã đặt</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshBookings}
                    disabled={bookingsLoading}
                    className="btn btn-ghost px-4 py-2 disabled:opacity-60"
                  >
                    {bookingsLoading ? 'Đang tải…' : 'Làm mới'}
                  </button>
                </div>
              </div>

              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {(showAllBookings ? bookings : bookings.slice(0, 5)).map((booking: Booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className="font-extrabold text-slate-900">
                              #{booking.id}
                              <span className="font-semibold text-slate-500 ml-2">Booking</span>
                            </div>
                            <span className={`badge ${getStatusColor(booking)}`}>{getStatusText(booking)}</span>
                          </div>

                          {booking.showtime && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-3">
                              <div className="font-semibold text-slate-900 line-clamp-1">
                                {booking.showtime?.movie?.title || 'Phim đã đặt'}
                              </div>
                              <div className="text-sm text-slate-600 mt-1">
                                {booking.showtime.room.cinema.name} • Phòng {booking.showtime.room.name}
                              </div>
                              <div className="text-sm text-slate-500 mt-1">
                                {new Date(booking.showtime.startTime).toLocaleString('vi-VN')}
                              </div>
                            </div>
                          )}

                          {booking.tickets && booking.tickets.length > 0 && (
                            <div className="mb-3">
                              <div className="text-sm font-semibold text-slate-700 mb-2">Ghế đã chọn</div>
                              <div className="flex flex-wrap gap-2">
                                {booking.tickets.map((t: any, idx: number) => (
                                  <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                                    {t.seat.row}
                                    {t.seat.number} • {t.seat.type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-sm text-slate-600">
                              <div>Ngày đặt: {booking.createdAt ? formatDate(booking.createdAt) : 'N/A'}</div>
                              <div>Khách hàng: <span className="font-semibold text-slate-900">{booking.customerName}</span></div>
                            </div>

                            <button
                              onClick={() => handleViewBookingDetail(booking)}
                              className="btn btn-ghost px-4 py-2 inline-flex items-center gap-2"
                            >
                              <TicketIcon className="h-4 w-4" />
                              Xem chi tiết
                            </button>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold text-indigo-600">
                            {booking.totalPrice?.toLocaleString('vi-VN')}đ
                          </div>
                          {booking.tickets && (
                            <div className="text-sm text-slate-500 mt-1">{booking.tickets.length} vé</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {bookings.length > 5 && (
                    <div className="pt-2 text-center">
                      <button onClick={handleViewMore} className="btn btn-ghost px-4 py-2">
                        {showAllBookings ? 'Thu gọn' : `Xem thêm ${bookings.length - 5} vé`}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <TicketIcon className="h-14 w-14 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Chưa có vé nào được đặt</h3>
                  <p className="text-slate-500 mb-5">Khám phá phim đang chiếu và đặt vé ngay.</p>
                  <button onClick={() => navigate('/movies')} className="btn btn-primary px-5 py-2.5">
                    Xem phim đang chiếu
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Hành động nhanh</h2>

              <div className="space-y-3">
                <QuickAction
                  icon={<TicketIcon className="h-5 w-5 text-indigo-600" />}
                  title="Đặt vé mới"
                  onClick={() => navigate('/movies')}
                />
                <QuickAction
                  icon={<BuildingOfficeIcon className="h-5 w-5 text-emerald-600" />}
                  title="Xem rạp chiếu"
                  onClick={() => navigate('/cinemas')}
                />
                <QuickAction
                  icon={<CreditCardIcon className="h-5 w-5 text-slate-600" />}
                  title="Làm mới trang"
                  onClick={() => window.location.reload()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm p-4 grid place-items-center">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto card">
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 inline-flex items-center gap-2">
                    <TicketIcon className="h-6 w-6 text-slate-600" />
                    Chi tiết vé đặt
                  </h2>
                  <p className="text-slate-500 mt-1">Xuất trình QR tại quầy/vào rạp.</p>
                </div>
                <button onClick={handleCloseBookingDetail} className="btn btn-ghost px-3 py-2" aria-label="Đóng">
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <div className="card-soft p-4">
                    <h3 className="font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
                      <FilmIcon className="h-5 w-5 text-slate-500" /> Thông tin phim
                    </h3>

                    <div className="flex items-center gap-4">
                      {selectedBooking?.movie?.posterUrl ? (
                        <img
                          src={selectedBooking.movie.posterUrl}
                          alt="Movie Poster"
                          className="w-16 h-20 object-cover rounded-xl border border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 grid place-items-center text-slate-400">
                          <FilmIcon className="h-8 w-8" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 line-clamp-1">
                          {selectedBooking?.movie?.title || 'Phim đã đặt'}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">Mã vé: #{selectedBooking.id}</div>
                        {selectedBooking?.movie?.genre && (
                          <div className="text-xs text-slate-500 mt-1">{selectedBooking.movie.genre}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-soft p-4">
                    <h3 className="font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-slate-500" /> Suất chiếu
                    </h3>

                    <div className="text-sm text-slate-600">
                      {selectedBooking?.showtime?.startTime
                        ? new Date(selectedBooking.showtime.startTime).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Ngày chiếu'}
                    </div>

                    <div className="font-extrabold text-slate-900 mt-1">
                      {selectedBooking?.showtime?.startTime
                        ? new Date(selectedBooking.showtime.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--:--'}
                      {' - '}
                      {selectedBooking?.showtime?.endTime
                        ? new Date(selectedBooking.showtime.endTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '--:--'}
                    </div>

                    {selectedBooking?.movie?.duration && (
                      <div className="text-xs text-slate-500 mt-1">Thời lượng: {selectedBooking.movie.duration} phút</div>
                    )}
                  </div>

                  <div className="card-soft p-4">
                    <h3 className="font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
                      <BuildingOfficeIcon className="h-5 w-5 text-slate-500" /> Rạp chiếu
                    </h3>

                    <div className="font-extrabold text-slate-900">
                      {selectedBooking?.showtime?.room?.cinema?.name || 'Rạp chiếu phim'}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {selectedBooking?.showtime?.room?.cinema?.address || 'Địa chỉ rạp chiếu'}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Phòng: {selectedBooking?.showtime?.room?.name || 'Phòng chiếu'}
                    </div>
                    {selectedBooking?.showtime?.room?.cinema?.phone && (
                      <div className="text-xs text-slate-500 mt-1">
                        Hotline: {selectedBooking.showtime.room.cinema.phone}
                      </div>
                    )}
                  </div>

                  <div className="card-soft p-4">
                    <h3 className="font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
                      <TicketIcon className="h-5 w-5 text-slate-500" /> Vé đã đặt (
                      {selectedBooking?.order?.tickets?.length || selectedBooking?.tickets?.length || 0})
                    </h3>

                    {(selectedBooking?.order?.tickets?.length || 0) > 0 || (selectedBooking?.tickets?.length || 0) > 0 ? (
                      <div className="space-y-2">
                        {(selectedBooking.order?.tickets || selectedBooking.tickets || []).map((t: any) => (
                          <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-lg font-extrabold text-slate-900">
                                  {t.seat?.seatNumber || `${t.seat?.row || ''}${t.seat?.number || ''}` || 'N/A'}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">
                                  {t.seat?.seatType === 'VIP'
                                    ? 'VIP'
                                    : t.seat?.seatType === 'COUPLE'
                                    ? 'Ghế đôi'
                                    : 'Ghế thường'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-extrabold text-emerald-600">
                                  {t.price ? `${t.price.toLocaleString('vi-VN')}đ` : 'N/A'}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {t.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">Không tìm thấy thông tin ghế chi tiết.</div>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-4">
                  <div className="card-soft p-6 text-center">
                    <h3 className="font-bold text-slate-900 mb-4 inline-flex items-center gap-2 justify-center">
                      <QrCodeIcon className="h-6 w-6 text-slate-500" /> Mã QR vé
                    </h3>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                      <img
                        src={qrCodeUrl || createQRCodeUrl(`TICKET_${selectedBooking.id}`)}
                        alt="QR Code"
                        className="mx-auto"
                        style={{ width: '200px', height: '200px' }}
                      />
                      <p className="text-sm text-slate-600 mt-4">
                        Xuất trình mã QR này tại rạp để vào xem phim.
                      </p>
                    </div>
                  </div>

                  <div className="card-soft p-4">
                    <h3 className="font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-slate-500" /> Thông tin khách hàng
                    </h3>

                    <div className="space-y-3 text-sm">
                      <Row label="Họ tên" value={selectedBooking.customerName} />
                      <Row label="Email" value={selectedBooking.customerEmail} />
                      <Row label="Số điện thoại" value={(selectedBooking as any).customerPhone || selectedBooking.order?.customerPhone || 'Chưa cập nhật'} />
                      <Row label="Mã vé" value={`#${selectedBooking.id}`} strong />
                      <div className="flex items-center justify-between">
                        <div className="text-slate-500">Trạng thái</div>
                        <span className={`badge ${getStatusColor(selectedBooking)}`}>{getStatusText(selectedBooking)}</span>
                      </div>
                      <Row
                        label="Tổng thanh toán"
                        value={`${selectedBooking.totalPrice?.toLocaleString('vi-VN')}đ`}
                        strong
                        valueClass="text-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="card-soft p-4">
                    <h4 className="font-bold text-slate-900 mb-3">Lưu ý</h4>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li>• Có mặt trước giờ chiếu 15 phút</li>
                      <li>• Mang theo mã QR và giấy tờ tùy thân</li>
                      <li>• Không đổi/trả vé sau thanh toán</li>
                      <li>• Kiểm tra kỹ thông tin trước khi vào rạp</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleCloseBookingDetail} className="btn btn-ghost px-5 py-2.5">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onPasswordChangeRequest={handlePasswordChangeRequest}
      />

      {/* OTP Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerifyOTP={handleVerifyOTP}
        email={otpEmail}
        onResendOTP={handleResendOTP}
      />
    </div>
  );
};

export default Profile;

/* ---------------- UI helpers ---------------- */

const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  editMode?: boolean;
  children?: React.ReactNode;
}> = ({ icon, label, value, editMode, children }) => {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
        <span className="text-slate-500">{icon}</span>
        {label}
      </div>

      {editMode && children ? (
        children
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
          {value}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; tone: 'indigo' | 'emerald' }> = ({ title, value, tone }) => {
  const toneCls =
    tone === 'indigo'
      ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-200';

  return (
    <div className={`rounded-2xl ring-1 ${toneCls} p-4 text-center`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-sm font-semibold mt-1">{title}</div>
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void }> = ({ icon, title, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition px-4 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold text-slate-900">{title}</span>
      </div>
      <span className="text-slate-400">→</span>
    </button>
  );
};

const Row: React.FC<{ label: string; value: string; strong?: boolean; valueClass?: string }> = ({
  label,
  value,
  strong,
  valueClass,
}) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-slate-500">{label}</div>
      <div className={`text-right break-words ${strong ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-800'} ${valueClass || ''}`}>
        {value}
      </div>
    </div>
  );
};
