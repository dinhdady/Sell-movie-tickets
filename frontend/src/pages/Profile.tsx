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
  EyeIcon
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
  userId: string;
  showtimeId: number;
  totalPrice: number;
  totalAmount: number;
  status: string;
  bookingStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
}


const Profile: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            // Lọc chỉ lấy vé của user hiện tại
            const userBookings = bookingsResponse.filter(booking => 
              booking.userId === authUser?.id || 
              booking.customerEmail === authUser?.email
            );
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
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleViewBookingDetail = async (booking: Booking) => {
    try {
      // Lưu thông tin booking vào localStorage để PaymentCallback có thể sử dụng
      localStorage.setItem('selectedBooking', JSON.stringify(booking));
      
      // Tạo txnRef giả để PaymentCallback có thể hoạt động
      const fakeTxnRef = `booking_${booking.id}_${Date.now()}`;
      localStorage.setItem('lastTxnRef', fakeTxnRef);
      
      // Chuyển hướng đến PaymentCallback
      navigate('/payment-callback');
    } catch (error) {
      console.error('Error preparing booking detail:', error);
      setError('Không thể xem chi tiết vé. Vui lòng thử lại.');
    }
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
            <span className="text-sm text-gray-600">
              {bookings.length} vé đã đặt
            </span>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          Mã đặt vé: #{booking.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Khách hàng: {booking.customerName}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Email: {booking.customerEmail}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        Ngày đặt: {formatDate(booking.createdAt)}
                      </p>
                      
                      {/* View Detail Button */}
                      <button
                        onClick={() => handleViewBookingDetail(booking)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600 mb-2">
                        {booking.totalPrice?.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {bookings.length > 5 && (
                <div className="text-center pt-4">
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Xem thêm ({bookings.length - 5} vé)
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

    </div>
  );
};

export default Profile;
