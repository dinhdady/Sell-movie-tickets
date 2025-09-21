import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
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
  EyeIcon,
  QrCodeIcon,
  BuildingOfficeIcon,
  FilmIcon,
  XMarkIcon as CloseIcon
} from '@heroicons/react/24/outline';

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
    seat: {
      row: string;
      number: number;
      type: string;
    };
    price: number;
    status: string;
    qrCodeUrl?: string;
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profileResponse = await userAPI.getProfile();
        setUserProfile(profileResponse.object);
        setEditedProfile(profileResponse.object);
        
        // Fetch user bookings - chỉ lấy vé của user hiện tại
        try {
          const bookingsResponse = await bookingAPI.getAll();
          if (Array.isArray(bookingsResponse)) {
            // Lọc chỉ lấy vé của user hiện tại và sắp xếp theo ngày tạo (mới nhất lên đầu)
            const userBookings = bookingsResponse
              .filter(booking => 
                booking.customerEmail === authUser?.email
              )
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setBookings(userBookings);
          } else {
            setBookings([]);
          }
        } catch (err) {
          console.log('No bookings found or error fetching bookings');
          setBookings([]);
        }
      } catch (err) {
        setError('Không thể tải thông tin người dùng');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserData();
    }
  }, [authUser]);

  // Auto-refresh when page becomes visible (e.g., returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authUser) {
        // Refresh bookings when page becomes visible
        const refreshBookings = async () => {
          try {
            setBookingsLoading(true);
            const bookingsResponse = await bookingAPI.getAll();
            if (Array.isArray(bookingsResponse)) {
              const userBookings = bookingsResponse
                .filter(booking => 
                  booking.customerEmail === authUser?.email
                )
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setBookings(userBookings);
            }
          } catch (err) {
            console.log('Error refreshing bookings:', err);
          } finally {
            setBookingsLoading(false);
          }
        };
        refreshBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authUser]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setEditedProfile(userProfile || {});
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    
    try {
      setSaveLoading(true);
      // Cast role to proper type
      const updateData = {
        ...editedProfile,
        role: editedProfile.role as 'USER' | 'ADMIN'
      };
      const response = await userAPI.updateProfile(updateData);
      setUserProfile(response.object);
      updateUser(response.object);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError('Không thể cập nhật thông tin');
      console.error('Error updating profile:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
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
      default:
        return status || 'Không xác định';
    }
  };

  const handleRefreshBookings = async () => {
    try {
      setBookingsLoading(true);
      const bookingsResponse = await bookingAPI.getAll();
      if (Array.isArray(bookingsResponse)) {
        const userBookings = bookingsResponse
          .filter(booking => 
            booking.customerEmail === authUser?.email
          )
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(userBookings);
      }
    } catch (err) {
      console.log('Error refreshing bookings:', err);
      setError('Không thể tải lại danh sách vé');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleViewBookingDetail = async (booking: Booking) => {
    try {
      console.log('🎯 [Profile] Fetching booking detail for ID:', booking.id);
      
      // Try to get detailed booking information using new API endpoint
      const response = await bookingAPI.getDetailsById(booking.id);
      console.log('🎯 [Profile] Booking detail response:', response);
      console.log('🎯 [Profile] Response state:', response.state);
      console.log('🎯 [Profile] Response object:', response.object);
      
      if (response.state === 'SUCCESS' && response.object) {
        console.log('✅ [Profile] Using detailed booking data from getDetailsById');
        console.log('🎯 [Profile] Movie:', (response.object as any).movie);
        console.log('🎯 [Profile] Showtime:', (response.object as any).showtime);
        console.log('🎯 [Profile] Order:', (response.object as any).order);
        console.log('🎯 [Profile] Tickets:', (response.object as any).order?.tickets);
        setSelectedBooking(response.object);
        setShowBookingDetail(true);
      } else {
        // Fallback to basic booking info if detailed API fails
        console.log('⚠️ [Profile] Detailed API failed, using basic booking info');
        console.log('🎯 [Profile] Basic booking data:', booking);
        setSelectedBooking(booking);
        setShowBookingDetail(true);
      }
    } catch (error) {
      console.error('❌ [Profile] Error fetching booking detail:', error);
      // Fallback to basic booking info
      console.log('⚠️ [Profile] API error, using basic booking info');
      console.log('🎯 [Profile] Basic booking data:', booking);
      setSelectedBooking(booking);
      setShowBookingDetail(true);
    }
  };

  const handleCloseBookingDetail = () => {
    setShowBookingDetail(false);
    setSelectedBooking(null);
  };

  const handleViewMore = () => {
    setShowAllBookings(!showAllBookings);
  };


  if (loading) return <LoadingSpinner />;

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Không thể tải thông tin người dùng</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Profile Information */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Thông tin tài khoản</h2>
            <button
              onClick={editMode ? handleSave : handleEditToggle}
              disabled={saveLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                editMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saveLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : editMode ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <PencilIcon className="h-4 w-4" />
              )}
              <span>{editMode ? 'Lưu' : 'Chỉnh sửa'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 mr-2" />
                Họ và tên
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editedProfile.fullName || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{userProfile.fullName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 mr-2" />
                Tên đăng nhập
              </label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-600">{userProfile.username}</p>
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email
              </label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-600">{userProfile.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Số điện thoại
              </label>
              {editMode ? (
                <input
                  type="tel"
                  value={editedProfile.phone || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{userProfile.phone || 'Chưa cập nhật'}</p>
              )}
            </div>

            {/* Join Date */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Ngày tham gia
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{formatDate(userProfile.createdAt)}</p>
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Loại tài khoản
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userProfile.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {userProfile.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleEditToggle}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Hủy</span>
              </button>
            </div>
          )}
            </div>

            {/* User Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thống kê tài khoản
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {bookings.length}
                  </div>
                  <div className="text-sm text-gray-600">Vé đã đặt</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {bookings.filter(b => b.status?.toLowerCase() === 'paid').length}
                  </div>
                  <div className="text-sm text-gray-600">Đã thanh toán</div>
                </div>
              </div>
            </div>

            {/* Security Settings Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Bảo mật tài khoản
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mật khẩu</p>
                    <p className="text-sm text-gray-600">Cập nhật lần cuối: 30 ngày trước</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Đổi mật khẩu
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Xác thực hai bước</p>
                    <p className="text-sm text-gray-600">Bảo vệ tài khoản tốt hơn</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Kích hoạt
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Thông báo email</p>
                    <p className="text-sm text-gray-600">Nhận thông báo về đơn hàng</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking History */}
          <div className="space-y-6">
            {/* Booking History */}
            <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TicketIcon className="h-5 w-5 mr-2" />
              Lịch sử đặt vé
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {bookings.length} vé đã đặt
              </span>
              <button
                onClick={handleRefreshBookings}
                disabled={bookingsLoading}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {bookingsLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <span>Làm mới</span>
                )}
              </button>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {(showAllBookings ? bookings : bookings.slice(0, 5)).map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="font-medium text-gray-900">
                          Mã đặt vé: #{booking.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      
                      {/* Movie and Showtime Info */}
                      {booking.showtime && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {booking.showtime?.movie?.title || 'Phim đã đặt'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            Rạp: {booking.showtime.room.cinema.name} - Phòng {booking.showtime.room.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Thời gian: {new Date(booking.showtime.startTime).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                      
                      {/* Tickets Info */}
                      {booking.tickets && booking.tickets.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Ghế đã chọn:</p>
                          <div className="flex flex-wrap gap-2">
                            {booking.tickets.map((ticket: any, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {ticket.seat.row}{ticket.seat.number} ({ticket.seat.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Ngày đặt: {booking.createdAt ? formatDate(booking.createdAt) : 'N/A'}</p>
                          <p>Khách hàng: {booking.customerName}</p>
                        </div>
                        
                        {/* View Detail Button */}
                        <button
                          onClick={() => handleViewBookingDetail(booking)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-blue-600 mb-2">
                        {booking.totalPrice?.toLocaleString('vi-VN')}đ
                      </p>
                      {booking.tickets && (
                        <p className="text-sm text-gray-500">
                          {booking.tickets.length} vé
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {bookings.length > 5 && (
                <div className="text-center pt-4">
                  <button 
                    onClick={handleViewMore}
                    className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {showAllBookings ? 'Thu gọn' : `Xem thêm ${bookings.length - 5} vé`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TicketIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có vé nào được đặt
              </h3>
              <p className="text-gray-600 mb-4">
                Bạn chưa đặt vé nào. Hãy khám phá các bộ phim đang chiếu và đặt vé ngay!
              </p>
              <button 
                onClick={() => navigate('/movies')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xem phim đang chiếu
              </button>
            </div>
          )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Hành động nhanh
              </h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/movies')}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <TicketIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium">Đặt vé mới</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button 
                  onClick={() => navigate('/cinemas')}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium">Xem rạp chiếu</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium">Làm mới trang</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TicketIcon className="h-6 w-6 mr-2" />
                  Chi tiết vé đặt
                </h2>
                <button
                  onClick={handleCloseBookingDetail}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Booking Info - Layout giống PaymentCallback */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Movie & Showtime Info */}
                <div className="space-y-6">
                  {/* Movie Information */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FilmIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Thông tin phim
                    </h3>
                    <div className="flex items-center space-x-4">
                      {selectedBooking?.movie?.posterUrl && (
                        <img
                          src={selectedBooking.movie.posterUrl}
                          alt="Movie Poster"
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedBooking?.movie?.title || 'Phim đã đặt'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mã vé: #{selectedBooking.id}
                        </div>
                        {selectedBooking?.movie?.genre && (
                          <div className="text-xs text-gray-400">
                            {selectedBooking.movie.genre}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Showtime Information */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Suất chiếu
                    </h3>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        {selectedBooking?.showtime?.startTime ? 
                          new Date(selectedBooking.showtime.startTime).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Ngày chiếu'
                        }
                      </div>
                      <div className="font-medium text-gray-900">
                        {selectedBooking?.showtime?.startTime ? 
                          new Date(selectedBooking.showtime.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--:--'
                        } - {selectedBooking?.showtime?.endTime ? 
                          new Date(selectedBooking.showtime.endTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--:--'
                        }
                      </div>
                      {selectedBooking?.movie?.duration && (
                        <div className="text-xs text-gray-500">
                          Thời lượng: {selectedBooking.movie.duration} phút
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cinema Information */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Rạp chiếu
                    </h3>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">
                        {selectedBooking?.showtime?.room?.cinema?.name || 'Rạp chiếu phim'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedBooking?.showtime?.room?.cinema?.address || 'Địa chỉ rạp chiếu'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phòng: {selectedBooking?.showtime?.room?.name || 'Phòng chiếu'}
                      </div>
                      {selectedBooking?.showtime?.room?.cinema?.phone && (
                        <div className="text-xs text-gray-500">
                          Hotline: {selectedBooking.showtime.room.cinema.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seats Information */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TicketIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Ghế đã đặt ({(selectedBooking?.order?.tickets?.length || selectedBooking?.tickets?.length || 0)})
                    </h3>
                    {selectedBooking?.order?.tickets && selectedBooking.order.tickets.length > 0 ? (
                      <div className="space-y-2">
                        {selectedBooking.order.tickets.map((ticket: any) => {
                          return (
                            <div 
                              key={ticket.id} 
                              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 bg-blue-50 px-2 py-1 rounded">
                                  {ticket.seat.seatNumber}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({ticket.seat.seatType === 'VIP' ? 'VIP' : 
                                    ticket.seat.seatType === 'COUPLE' ? 'Ghế đôi' : 'Ghế thường'})
                                </span>
                                {ticket.status === 'PAID' && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Đã thanh toán
                                  </span>
                                )}
                              </div>
                              <div className="font-medium text-gray-900">
                                {ticket.price.toLocaleString('vi-VN')}đ
                              </div>
                            </div>
                          );
                        })}
                        
                        <div className="pt-2 mt-2 border-t">
                          <div className="flex justify-between items-center font-medium">
                            <span>Tổng cộng:</span>
                            <span className="text-lg text-blue-600">
                              {selectedBooking.order.tickets.reduce((sum: number, ticket: any) => {
                                return sum + ticket.price;
                              }, 0).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                        
                        {/* Thông tin thêm về booking */}
                        <div className="pt-2 mt-2 border-t bg-gray-50 p-3 rounded">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Mã booking:</span>
                              <span className="font-medium">#{selectedBooking.id}</span>
                            </div>
                            {selectedBooking.totalPrice && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tổng thanh toán:</span>
                                <span className="font-medium">{selectedBooking.totalPrice.toLocaleString('vi-VN')}đ</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <TicketIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">Không tìm thấy thông tin ghế chi tiết</p>
                        <p className="text-sm mt-1">
                          Booking #{selectedBooking.id} - Tổng: {selectedBooking.totalPrice?.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-xs mt-1 text-gray-400">
                          Vui lòng liên hệ hỗ trợ nếu cần thông tin chi tiết
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - QR Code & Customer Info */}
                <div className="space-y-6">
                  {/* QR Code */}
                  {selectedBooking?.order?.tickets?.[0]?.qrCodeUrl && (
                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-center">
                        <QrCodeIcon className="h-5 w-5 mr-2 text-gray-600" />
                        Mã QR vé
                      </h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <img
                          src={selectedBooking.order.tickets[0].qrCodeUrl}
                          alt="QR Code"
                          className="mx-auto mb-2"
                          style={{ width: '150px', height: '150px' }}
                        />
                        <p className="text-xs text-gray-600">
                          Xuất trình mã QR này tại rạp
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Mã vé: {selectedBooking.order.tickets[0].token}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Customer Information */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                      Thông tin khách hàng
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Họ tên</div>
                        <div className="font-medium text-gray-900">
                          {selectedBooking.customerName}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900 break-words">
                          {selectedBooking.customerEmail}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Số điện thoại</div>
                        <div className="font-medium text-gray-900">
                          {(selectedBooking as any).customerPhone || selectedBooking.order?.customerPhone || 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Địa chỉ</div>
                        <div className="font-medium text-gray-900">
                          {(selectedBooking as any).customerAddress || selectedBooking.order?.customerAddress || 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Trạng thái</div>
                        <div className="font-medium">
                          <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedBooking.status || selectedBooking.order?.status || (selectedBooking as any).paymentStatus)}`}>
                            {getStatusText(selectedBooking.status || selectedBooking.order?.status || (selectedBooking as any).paymentStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Lưu ý quan trọng</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Có mặt trước giờ chiếu 15 phút</li>
                      <li>• Mang theo mã QR và giấy tờ tùy thân</li>
                      <li>• Không được đổi/trả vé sau thanh toán</li>
                      <li>• Kiểm tra kỹ thông tin trước khi vào rạp</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseBookingDetail}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
