import React, { useState, useEffect } from 'react';
import { movieAPI } from '../services/api';
import type { Movie, Showtime } from '../types/movie';
import BookingSidebar from './BookingSidebar';
import { 
  ClockIcon, 
  CalendarIcon, 
  PlayIcon,
  MapPinIcon,
  UserGroupIcon,
  XMarkIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/outline';
interface MovieDetailModalProps {
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTicket: (movieId: number, showtimeId?: number) => void;
  onBookingSuccess?: (bookingId: number) => void;
}
const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ 
  movieId, 
  isOpen, 
  onClose, 
  onBookTicket,
  onBookingSuccess
}) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId || !isOpen) return;
      try {
        setLoading(true);
        setError('');
        const [movieResponse, showtimesResponse] = await Promise.all([
          movieAPI.getById(movieId),
          movieAPI.getShowtimes(movieId)
        ]);
        if (movieResponse.state === 'SUCCESS') {
          setMovie(movieResponse.object);
        } else {
          setError('Không tìm thấy phim');
        }
        if (showtimesResponse.state === 'SUCCESS') {
          setShowtimes(showtimesResponse.object);
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải thông tin phim');
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [movieId, isOpen]);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOW_SHOWING':
        return 'bg-green-100 text-green-800';
      case 'COMING_SOON':
        return 'bg-blue-100 text-blue-800';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'NOW_SHOWING':
        return 'Đang chiếu';
      case 'COMING_SOON':
        return 'Sắp chiếu';
      case 'ENDED':
        return 'Kết thúc';
      default:
        return status;
    }
  };
  const handleBookTicket = (movieId: number, showtimeId?: number) => {
    if (showtimeId) {
      onBookTicket(movieId, showtimeId);
    } else {
      setIsBookingOpen(true);
    }
  };
  const handleBookingSuccess = (bookingId: number) => {
    setIsBookingOpen(false);
    onClose();
    if (onBookingSuccess) {
      onBookingSuccess(bookingId);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto modal-backdrop">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden modal-content">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-responsive-lg">Chi tiết phim</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
              </div>
            ) : movie ? (
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* Movie Poster */}
                  <div className="lg:w-1/3">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <PlayIcon className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Movie Info */}
                  <div className="lg:w-2/3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                      <div className="flex-1 min-w-0 text-container">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 line-clamp-2 break-words">
                          {movie.title}
                        </h1>
                        <div className="flex items-center space-x-4 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(movie.status)}`}>
                            {getStatusText(movie.status)}
                          </span>
                          <span className="px-3 py-1 bg-red-500 text-white rounded text-sm font-bold">
                            {movie.filmRating}
                          </span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0 form-element-fixed">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600 text-ellipsis">
                          {movie.price.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center mb-6">
                      <StarSolidIcon className="h-6 w-6 text-yellow-400 mr-2" />
                      <span className="text-xl font-semibold text-gray-900 mr-4">
                        {movie.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-600">/ 10</span>
                    </div>
                    {/* Movie Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <span>{formatDuration(movie.duration)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <span>{formatDate(movie.releaseDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-3 text-gray-400">Thể loại:</span>
                        <span className="font-medium">{movie.genre}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-3 text-gray-400">Đạo diễn:</span>
                        <span className="font-medium">{movie.director}</span>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nội dung</h3>
                      <p className="text-gray-600 leading-relaxed text-wrap break-words">{movie.description}</p>
                    </div>
                    {/* Cast */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Diễn viên</h3>
                      <p className="text-gray-600 text-wrap break-words">{movie.cast}</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {movie.trailerUrl && (
                        <button className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors form-element">
                          <PlayIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                          <span className="text-ellipsis">Xem trailer</span>
                        </button>
                      )}
                      {movie.status === 'NOW_SHOWING' && (
                        <button
                          onClick={() => handleBookTicket(movie.id)}
                          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold form-element"
                        >
                          <span className="text-ellipsis">Đặt vé ngay</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Showtimes */}
                {showtimes.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch chiếu</h2>
                  <div className="space-y-4">
                    {showtimes.map((showtime) => (
                      <div key={showtime.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between min-w-0">
                          <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
                            <div className="flex items-center text-gray-600 flex-shrink-0">
                              <MapPinIcon className="h-5 w-5 mr-2" />
                              <span className="text-ellipsis">{showtime.room?.name || 'Phòng chiếu'}</span>
                            </div>
                            <div className="flex items-center text-gray-600 flex-shrink-0">
                              <UserGroupIcon className="h-5 w-5 mr-2" />
                              <span className="text-ellipsis">{showtime.room?.capacity || 0} ghế</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 flex-shrink-0">
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Bắt đầu</div>
                              <div className="font-semibold text-lg text-ellipsis">
                                {formatTime(showtime.startTime)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Kết thúc</div>
                              <div className="font-semibold text-lg text-ellipsis">
                                {formatTime(showtime.endTime)}
                              </div>
                            </div>
                            {movie.status === 'NOW_SHOWING' && (
                              <button
                                onClick={() => handleBookTicket(movie.id, showtime.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors form-element"
                              >
                                <span className="text-ellipsis">Chọn ghế</span>
                              </button>
                            )}
                          </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {/* Booking Sidebar */}
      <BookingSidebar
        movieId={movieId}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};
export default MovieDetailModal;
