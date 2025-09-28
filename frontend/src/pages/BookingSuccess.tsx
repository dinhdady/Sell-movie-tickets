import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
// import type { Booking } from '../types/booking';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
const BookingSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showBookingSuccess, showPaymentSuccess } = useNotifications();
  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await bookingAPI.getById(parseInt(id));
        if (response.state === 'SUCCESS') {
          setBooking(response.object);
          
          // Show success notifications
          await showBookingSuccess({
            movieTitle: response.object.movie?.title || 'Phim',
            showtime: response.object.showtime?.startTime || '',
            totalPrice: response.object.totalPrice || 0
          });
          
          await showPaymentSuccess(response.object.totalPrice || 0);
        } else {
          setError('Không tìm thấy thông tin đặt vé');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải thông tin đặt vé');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <Link
            to="/movies"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Quay lại danh sách phim
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt vé thành công!
          </h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt vé. Thông tin chi tiết được hiển thị bên dưới.
          </p>
        </div>
        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Thông tin đặt vé</h2>
                <p className="text-blue-100">Mã đặt vé: #{booking.id}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Trạng thái</div>
                <div className="font-semibold">
                  {booking.bookingStatus === 'PENDING' && 'Chờ xác nhận'}
                  {booking.bookingStatus === 'CONFIRMED' && 'Đã xác nhận'}
                  {booking.bookingStatus === 'COMPLETED' && 'Hoàn thành'}
                  {booking.bookingStatus === 'CANCELLED' && 'Đã hủy'}
                </div>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Movie Info */}
            <div className="flex items-start space-x-4">
              {booking.showtime?.movie?.posterUrl && (
                <img
                  src={booking.showtime.movie.posterUrl}
                  alt={booking.showtime.movie.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {booking.showtime?.movie?.title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>
                      {booking.showtime && new Date(booking.showtime.startTime).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{booking.showtime?.room?.name}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Customer Info */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="ml-2 font-medium">{booking.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{booking.customerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="ml-2 font-medium">{booking.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ngày đặt:</span>
                  <span className="ml-2 font-medium">
                    {new Date(booking.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
            {/* Tickets */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <TicketIcon className="h-5 w-5 mr-2" />
                Vé đã đặt
              </h4>
              <div className="space-y-2">
                {booking.tickets?.map((ticket: any) => (
                  <div key={ticket.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">
                        Ghế {ticket.seat?.seatNumber}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({ticket.seat?.seatType})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {ticket.price.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticket.status === 'ACTIVE' && 'Có hiệu lực'}
                        {ticket.status === 'USED' && 'Đã sử dụng'}
                        {ticket.status === 'CANCELLED' && 'Đã hủy'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Total */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Tổng tiền
                </span>
                <span className="text-blue-600">
                  {booking.totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
            {/* Actions */}
            <div className="border-t pt-6 flex flex-col sm:flex-row gap-4">
              <Link
                to="/movies"
                className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Đặt vé khác
              </Link>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-600 text-white text-center py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                In vé
              </button>
            </div>
          </div>
        </div>
        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Lưu ý quan trọng:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Vui lòng đến rạp trước giờ chiếu ít nhất 15 phút</li>
            <li>• Mang theo giấy tờ tùy thân để đối chiếu thông tin</li>
            <li>• Vé có thể được hủy trước giờ chiếu 2 tiếng</li>
            <li>• Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default BookingSuccess;
