import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, paymentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  TicketIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: ''
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng');
      return;
    }

    try {
      setLoading(true);

      // Process each cart item as a separate booking
      const promises = items.map(async (item) => {
        const orderData = {
          userId: user?.id,
          showtimeId: item.showtime.id,
          seatIds: item.seats.map(seat => seat.id),
          totalPrice: item.totalPrice,
          totalAmount: item.totalPrice,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          customerAddress: customerInfo.address
        };

        const orderResponse = await orderAPI.create(orderData);
        
        // Create VNPay payment
        const paymentData = {
          orderId: orderResponse.object.id,
          amount: item.totalPrice,
          orderInfo: `Thanh toán vé phim ${item.movie.title}`,
          returnUrl: `${window.location.origin}/payment-callback`
        };

        return paymentAPI.createVNPayPayment(paymentData);
      });

      const paymentUrls = await Promise.all(promises);
      
      // Clear cart after successful order creation
      clearCart();
      
      // Redirect to first payment URL (for simplicity)
      if (paymentUrls.length > 0) {
        window.location.href = paymentUrls[0];
      }

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600 mb-8">
            Bạn cần đăng nhập để tiến hành thanh toán
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h1>
          <p className="text-gray-600 mb-8">
            Không có vé nào để thanh toán
          </p>
          <button
            onClick={() => navigate('/movies')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Chọn vé phim
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán
          </h1>
          <p className="text-gray-600">
            Xác nhận thông tin và hoàn tất đặt vé
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Thông tin khách hàng
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0123456789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Nhập địa chỉ (tùy chọn)"
                />
              </div>
            </div>

            {/* Payment Security */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Thanh toán an toàn</span>
              </div>
              <p className="text-sm text-green-700">
                Thông tin của bạn được bảo vệ bằng mã hóa SSL 256-bit
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TicketIcon className="h-5 w-5 mr-2" />
                Chi tiết đơn hàng
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border-b border-gray-200 pb-4">
                    <div className="flex space-x-4">
                      <img
                        src={item.movie.posterUrl || '/placeholder-movie.jpg'}
                        alt={item.movie.title}
                        className="w-16 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {item.movie.title}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDateTime(item.showtime.startTime)}
                          </div>
                          {item.showtime.room && (
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              Phòng {item.showtime.room.name}
                            </div>
                          )}
                          {item.seats && item.seats.length > 0 && (
                            <p>
                              Ghế: {item.seats.map(seat => 
                                seat.seatNumber || `${seat.rowNumber}${seat.columnNumber}`
                              ).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 text-right">
                          <span className="font-bold text-blue-600">
                            {formatPrice(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Phương thức thanh toán
              </h2>
              
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src="/vnpay-logo.png" 
                      alt="VNPay" 
                      className="h-8 w-auto mr-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="font-medium text-blue-900">VNPay</span>
                  </div>
                  <span className="text-sm text-blue-700">
                    Thanh toán qua ví điện tử, ATM, Visa/Master
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : `Thanh toán ${formatPrice(totalPrice)}`}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-600 text-center">
              Bằng cách nhấn "Thanh toán", bạn đồng ý với{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Chính sách bảo mật
              </a>{' '}
              của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
