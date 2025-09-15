import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { movieAPI, showtimeAPI, bookingAPI } from '../services/api';
import type { Movie, Showtime } from '../types/movie';
import type { Seat } from '../types/booking';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ClockIcon, 
  MapPinIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const movieResponse = await movieAPI.getById(parseInt(id));
        
        if (movieResponse.state === '200') {
          setMovie(movieResponse.object);
        } else {
          setError('Không tìm thấy phim');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    // TODO: Fetch seats for the selected showtime
    // This would require a new API endpoint
  };

  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'OCCUPIED') return;

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
    if (seat.status === 'OCCUPIED') return 'bg-gray-400 cursor-not-allowed';
    if (selectedSeats.find(s => s.id === seat.id)) return 'bg-blue-600 text-white';
    if (seat.seatType === 'VIP') return 'bg-yellow-500 hover:bg-yellow-600';
    if (seat.seatType === 'COUPLE') return 'bg-pink-500 hover:bg-pink-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;

    try {
      const bookingData = {
        userId: user?.id,
        showtimeId: selectedShowtime.id,
        totalAmount: calculateTotal(),
        customerName: user?.fullName || '',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        bookingStatus: 'PENDING' as const
      };

      const response = await bookingAPI.create(bookingData);
      if (response.state === '200') {
        navigate(`/booking-success/${response.object.id}`);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Có lỗi xảy ra khi đặt vé');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <button
            onClick={() => navigate('/movies')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Quay lại danh sách phim
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Movie Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center space-x-6">
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-24 h-32 object-cover rounded-lg"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {movie.title}
                </h1>
                <p className="text-gray-600 mb-4">{movie.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {movie.genre}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Showtime Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Chọn suất chiếu
                </h2>
                
                {showtimes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        onClick={() => handleShowtimeSelect(showtime)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          selectedShowtime?.id === showtime.id
                            ? 'border-blue-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {new Date(showtime.startTime).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(showtime.endTime).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {showtime.room?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {showtime.room?.capacity} ghế
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có suất chiếu nào cho phim này
                  </p>
                )}
              </div>

              {/* Seat Selection */}
              {selectedShowtime && (
                <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Chọn ghế
                  </h2>
                  
                  {/* Seat Legend */}
                  <div className="flex items-center space-x-6 mb-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span>Ghế thường</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                      <span>Ghế VIP</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-pink-500 rounded mr-2"></div>
                      <span>Ghế đôi</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                      <span>Đã đặt</span>
                    </div>
                  </div>

                  {/* Seat Map */}
                  <div className="space-y-2">
                    {seats.length > 0 ? (
                      <div className="grid grid-cols-10 gap-2">
                        {seats.map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatSelect(seat)}
                            disabled={seat.status === 'OCCUPIED'}
                            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${getSeatColor(seat)}`}
                          >
                            {seat.number}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Chưa có thông tin ghế cho suất chiếu này
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Tóm tắt đặt vé
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Phim</div>
                    <div className="font-medium">{movie.title}</div>
                  </div>
                  
                  {selectedShowtime && (
                    <div>
                      <div className="text-sm text-gray-600">Suất chiếu</div>
                      <div className="font-medium">
                        {new Date(selectedShowtime.startTime).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-gray-600">Ghế đã chọn</div>
                    <div className="space-y-1">
                      {selectedSeats.map((seat) => (
                        <div key={seat.id} className="flex justify-between text-sm">
                          <span>Ghế {seat.row}{seat.number}</span>
                          <span>{seat.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBooking}
                    disabled={!selectedShowtime || selectedSeats.length === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Đặt vé
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Booking;
