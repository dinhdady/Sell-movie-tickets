import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, orderAPI } from '../services/api';
import { paymentApi } from '../services/paymentApi';
import { cookieService } from '../services/cookieService';
import type { Seat } from '../types/booking';
import type { PaymentRequest } from '../types/payment';
// import type { Coupon } from '../types/coupon';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  TagIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
}
const BookingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // Get booking data from location state
  const { movie, showtime, selectedSeats, totalPrice, appliedCoupon, discountAmount, appliedEvent, eventDiscountAmount, finalTotal } = location.state || {};
  // Add debug logging
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: user?.fullName || user?.username || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    customerAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Partial<BookingFormData>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  useEffect(() => {
    // Redirect if no booking data
    if (!movie || !showtime || !selectedSeats || selectedSeats.length === 0) {
      navigate(`/booking/${id}`);
    }
  }, [movie, showtime, selectedSeats, id, navigate]);
  // Early return if no data to prevent rendering errors
  if (!movie || !showtime || !selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  const validateForm = (): boolean => {
    const errors: Partial<BookingFormData> = {};
    if (!formData.customerName.trim()) {
      errors.customerName = 'Vui lòng nhập họ tên';
    }
    if (!formData.customerEmail.trim()) {
      errors.customerEmail = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.customerEmail = 'Email không hợp lệ';
    }
    if (!formData.customerPhone.trim()) {
      errors.customerPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      errors.customerPhone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.customerAddress.trim()) {
      errors.customerAddress = 'Vui lòng nhập địa chỉ';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (!user) {
      setError('Vui lòng đăng nhập để đặt vé');
      return;
    }
    if (!selectedPaymentMethod) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }
    try {
      setLoading(true);
      setError('');
      // Force refresh user from cookie to get latest ID
      const currentUser = user;
      const validUserId = currentUser?.id || Math.random().toString(36).substring(2, 10);
      // Step 1: Create Order first to get txnRef
      const orderData = {
        userId: validUserId,
        showtimeId: showtime.id,
        totalPrice: finalTotal || totalPrice,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress
      };
      const orderResponse = await orderAPI.create(orderData);
      if (orderResponse.state !== 'SUCCESS') {
        throw new Error(orderResponse.message || 'Failed to create order');
      }
      const createdOrder = orderResponse.object;
      // Store txnRef in cookie for payment callback
      cookieService.setTempData('currentTxnRef', createdOrder.txnRef);
      // Step 2: Create booking with the order ID
      const bookingData = {
        userId: validUserId,
        showtimeId: showtime.id,
        orderId: createdOrder.id,
        totalPrice: finalTotal || totalPrice,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        seatIds: selectedSeats.map((seat: Seat) => seat.id),
        couponCode: appliedCoupon?.code || null
      };
      const response = await bookingAPI.create(bookingData);
      if (response.state === 'SUCCESS') {
        // Create payment request
        const paymentRequest: PaymentRequest = {
          bookingId: response.object.id,
          paymentMethod: selectedPaymentMethod,
          amount: finalTotal || totalPrice,
          returnUrl: `${window.location.origin}/payment/callback`,
          cancelUrl: `${window.location.origin}/booking/${id}`,
          description: `Thanh toán vé xem phim ${movie.title}${appliedCoupon ? ` (Đã áp dụng coupon ${appliedCoupon.code})` : ''}`
        };
        
        // Create payment based on selected method
        const paymentResponse = await paymentApi.createPayment(paymentRequest);
        
        // Show loading state before redirect
        setLoading(true);
        
        // Store booking info for fallback
        cookieService.setTempData('pendingBooking', JSON.stringify({
          bookingId: response.object.id,
          movie: movie,
          showtime: showtime,
          selectedSeats: selectedSeats,
          totalPrice: finalTotal || totalPrice,
          appliedCoupon: appliedCoupon,
          discountAmount: discountAmount,
          txnRef: createdOrder.txnRef,
          paymentMethod: selectedPaymentMethod
        }));
        
        // Small delay to show loading state
        setTimeout(() => {
          try {
            window.location.href = paymentResponse.paymentUrl;
          } catch {
            setError('Không thể chuyển hướng đến trang thanh toán. Vui lòng thử lại.');
            setLoading(false);
          }
        }, 1000);
      } else {
        setError(response.message || 'Đặt vé thất bại');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Có lỗi xảy ra khi đặt vé');
      } else {
        setError('Có lỗi xảy ra khi đặt vé');
      }
    } finally {
      setLoading(false);
    }
  };
  if (!movie || !showtime || !selectedSeats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Thông tin đặt vé</h1>
              <p className="text-blue-100">Vui lòng điền đầy đủ thông tin để hoàn tất đặt vé</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Summary */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin đặt vé</h2>
                    {/* Movie Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-4">
                        {movie.posterUrl && (
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{movie.title}</h3>
                          <p className="text-sm text-gray-600">{movie.genre}</p>
                          <p className="text-sm text-gray-600">
                            {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Showtime Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Suất chiếu</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(showtime.startTime).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(showtime.endTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{showtime.room?.name}</p>
                    </div>
                    {/* Seats Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Ghế đã chọn</h4>
                      <div className="space-y-1">
                        {selectedSeats.map((seat: Seat) => (
                          <div key={seat.id} className="flex justify-between text-sm">
                            <span>Ghế {seat.rowNumber}{seat.columnNumber} ({seat.seatType})</span>
                            <span>{(seat.price || 0).toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span>Tạm tính</span>
                          <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                        {appliedCoupon && discountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <TagIcon className="w-3 h-3" />
                              Giảm giá Coupon ({appliedCoupon.code})
                            </span>
                            <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                        {appliedEvent && eventDiscountAmount > 0 && (
                          <div className="flex justify-between text-blue-600">
                            <span className="flex items-center gap-1">
                              <FilmIcon className="w-3 h-3" />
                              Giảm giá Sự kiện ({appliedEvent.name})
                            </span>
                            <span>-{eventDiscountAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Tổng cộng</span>
                          <span className="text-blue-600">
                            {(finalTotal || totalPrice).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Booking Form */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <UserIcon className="h-4 w-4 inline mr-1" />
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.customerName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {validationErrors.customerName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.customerName}</p>
                      )}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.customerEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập email"
                      />
                      {validationErrors.customerEmail && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.customerEmail}</p>
                      )}
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <PhoneIcon className="h-4 w-4 inline mr-1" />
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.customerPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      {validationErrors.customerPhone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.customerPhone}</p>
                      )}
                    </div>
                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPinIcon className="h-4 w-4 inline mr-1" />
                        Địa chỉ *
                      </label>
                      <textarea
                        value={formData.customerAddress}
                        onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.customerAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập địa chỉ"
                      />
                      {validationErrors.customerAddress && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.customerAddress}</p>
                      )}
                    </div>
                    
                    {/* Payment Method Selection */}
                    <div className="pt-4">
                      <PaymentMethodSelector
                        selectedMethod={selectedPaymentMethod}
                        onMethodSelect={setSelectedPaymentMethod}
                        amount={finalTotal || totalPrice}
                      />
                    </div>
                    
                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <CreditCardIcon className="h-5 w-5 mr-2" />
                            Thanh toán {(finalTotal || totalPrice).toLocaleString('vi-VN')}đ
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        ← Quay lại chọn ghế
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
export default BookingForm;
