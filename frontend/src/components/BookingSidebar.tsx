import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { movieAPI, bookingAPI } from '../services/api';
import type { Movie, Showtime } from '../types/movie';
import type { Seat } from '../types/booking';
import { 
  ClockIcon, 
  MapPinIcon,
  XMarkIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/outline';
interface BookingSidebarProps {
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (bookingId: number) => void;
}
const BookingSidebar: React.FC<BookingSidebarProps> = ({ 
  movieId, 
  isOpen, 
  onClose, 
  onBookingSuccess 
}) => {
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      if (!movieId || !isOpen) return;
      try {
        setLoading(true);
        setError('');
        const movieResponse = await movieAPI.getById(movieId);
        if (movieResponse.state === '200') {
          setMovie(movieResponse.object);
        } else {
          setError('Không tìm thấy phim');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId, isOpen]);
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!movieId || !isOpen) return;
      try {
        const response = await movieAPI.getShowtimes(movieId);
        if (response.state === '200') {
          setShowtimes(response.object);
        }
      } catch (err) {
      }
    };
    fetchShowtimes();
  }, [movieId, isOpen]);
  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    // TODO: Fetch seats for the selected showtime
    // This would require a new API endpoint
  };
  const handleSeatSelect = (seat: Seat) => {
    // Don't allow selection of booked, reserved, or maintenance seats
    if (seat.status === 'BOOKED' || seat.status === 'RESERVED' || seat.status === 'MAINTENANCE') return;
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };
  const getSeatColor = (seat: Seat) => {
    // Check if seat is selected
    if (selectedSeats.find(s => s.id === seat.id)) return 'bg-blue-600 text-white';
    // Check seat status first
    switch (seat.status) {
      case 'BOOKED':
        return 'bg-red-600 text-white cursor-not-allowed opacity-80';
      case 'RESERVED':
        return 'bg-orange-500 text-white cursor-not-allowed opacity-80';
      case 'MAINTENANCE':
        return 'bg-gray-500 text-white cursor-not-allowed opacity-60';
      case 'AVAILABLE':
      default:
        // Color by seat type for available seats
        if (seat.seatType === 'VIP') return 'bg-yellow-500 hover:bg-yellow-600';
        if (seat.seatType === 'COUPLE') return 'bg-pink-500 hover:bg-pink-600';
        return 'bg-green-500 hover:bg-green-600';
    }
  };
  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      // Use seat price from database, fallback to seat type pricing
      const seatPrice = seat.price || getSeatTypePrice(seat.seatType);
      return total + seatPrice;
    }, 0);
  };
  const getSeatTypePrice = (seatType: string) => {
    const basePrice = 80000; // Default base price
    switch (seatType) {
      case 'VIP':
        return basePrice * 1.5;
      case 'COUPLE':
        return basePrice * 2;
      case 'REGULAR':
      default:
        return basePrice;
    }
  };
  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0 || !user) return;
    try {
      const bookingData = {
        userId: user.id,
        showtimeId: selectedShowtime.id,
        totalAmount: calculateTotal(),
        customerName: user.fullName || '',
        customerEmail: user.email || '',
        customerPhone: user.phone || '',
        bookingStatus: 'PENDING' as const
      };
      const response = await bookingAPI.create(bookingData);
      if (response.state === '200') {
        onBookingSuccess(response.object.id);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đặt vé');
    }
  };
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-hidden sidebar-backdrop">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white shadow-xl transform transition-transform sidebar-content flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-responsive-lg text-ellipsis">Đặt vé</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto flex-1 pb-24 sm:pb-20 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <div className="text-red-400 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
            </div>
          ) : movie ? (
            <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
              {/* Movie Info */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 text-container">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2 break-words">
                    {movie.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center flex-shrink-0">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span className="text-ellipsis">{formatDuration(movie.duration)}</span>
                    </span>
                    <span className="flex items-center flex-shrink-0">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="text-ellipsis">{movie.genre}</span>
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <StarSolidIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-gray-700">
                      {movie.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 form-element-fixed">
                  <div className="text-base sm:text-lg font-bold text-blue-600 text-ellipsis">
                    {movie.price.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>
              {/* Showtime Selection */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 text-responsive-base">
                  Chọn suất chiếu
                </h4>
                {showtimes.length > 0 ? (
                  <div className="space-y-2">
                    {showtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        onClick={() => handleShowtimeSelect(showtime)}
                        className={`w-full p-3 border rounded-lg text-left transition-colors ${
                          selectedShowtime?.id === showtime.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between min-w-0">
                          <div className="flex-1 min-w-0 text-container">
                            <div className="font-medium text-gray-900 text-ellipsis">
                              {new Date(showtime.startTime).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-sm text-gray-600 text-ellipsis">
                              {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="text-sm text-gray-600 text-ellipsis">
                              {showtime.room?.name}
                            </div>
                            <div className="text-xs text-gray-500 text-ellipsis">
                              {showtime.room?.capacity} ghế
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có suất chiếu nào
                  </p>
                )}
              </div>
              {/* Seat Selection */}
              {selectedShowtime && (
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 text-responsive-base">
                    Chọn ghế
                  </h4>
                  {/* Seat Legend */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span>Ghế thường</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                      <span>Ghế VIP</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-pink-500 rounded mr-2"></div>
                      <span>Ghế đôi</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                      <span>Đã đặt</span>
                    </div>
                  </div>
                  {/* Seat Map */}
                  <div className="space-y-2">
                    {seats.length > 0 ? (
                      <div className="grid grid-cols-8 gap-1">
                        {seats.map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatSelect(seat)}
                            disabled={seat.status === 'OCCUPIED'}
                            className={`w-6 h-6 rounded text-xs font-medium transition-colors ${getSeatColor(seat)}`}
                          >
                            {seat.seatNumber}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Chưa có thông tin ghế
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* Selected Seats Summary */}
              {selectedSeats.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 text-responsive-base">
                    Ghế đã chọn
                  </h4>
                  <div className="space-y-2">
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="flex justify-between text-sm min-w-0">
                        <span className="text-ellipsis flex-1 min-w-0">Ghế {seat.seatNumber}</span>
                        <span className="text-ellipsis flex-shrink-0 ml-2">{seat.price.toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold min-w-0">
                      <span className="text-ellipsis flex-1 min-w-0">Tổng cộng</span>
                      <span className="text-ellipsis flex-shrink-0 ml-2">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-gray-200 fixed-form-container">
          <button
            onClick={handleBooking}
            disabled={!selectedShowtime || selectedSeats.length === 0 || !user}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base form-element"
          >
            <span className="text-ellipsis">{!user ? 'Vui lòng đăng nhập' : 'Đặt vé'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default BookingSidebar;
