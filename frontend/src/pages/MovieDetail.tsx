import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/api';
import type { Movie, Showtime } from '../types/movie';
import BookingSidebar from '../components/BookingSidebar';
import { 
  ClockIcon, 
  CalendarIcon, 
  PlayIcon,
  MapPinIcon,
  UserGroupIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [movieResponse, showtimesResponse] = await Promise.all([
          movieAPI.getById(parseInt(id)),
          movieAPI.getShowtimes(parseInt(id))
        ]);

        if (movieResponse.state === 'SUCCESS') {
          setMovie(movieResponse.object);
        } else {
          // Generate mock movie data if API fails
          const mockMovie: Movie = {
            id: parseInt(id!),
            title: 'Vua Trở Lại',
            description: 'Phim hành động kịch tính về cuộc chiến giành lại ngai vàng của một vị vua bị lưu đày.',
            duration: 120,
            releaseDate: '2024-01-15',
            genre: 'Hành Động, Phiêu Lưu',
            director: 'Nguyễn Văn A',
            cast: 'Trần Văn B, Lê Thị C, Phạm Văn D',
            rating: 8.6,
            status: 'NOW_SHOWING',
            filmRating: 'PG13',
            price: 80000,
            posterUrl: 'http://res.cloudinary.com/dp9ltogc9/image/upload/v1752393509/Cinema/99998d7a-6.png'
          };
          setMovie(mockMovie);
        }

        if (showtimesResponse.state === 'SUCCESS') {
          setShowtimes(showtimesResponse.object);
        } else {
          // Generate mock showtimes if API fails
          const mockShowtimes: Showtime[] = [];
          const today = new Date();
          
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const times = ['10:00', '14:00', '18:00', '20:30'];
            times.forEach((time, index) => {
              const [hours, minutes] = time.split(':').map(Number);
              const startTime = new Date(date);
              startTime.setHours(hours, minutes, 0, 0);
              
              const endTime = new Date(startTime);
              endTime.setHours(startTime.getHours() + 2);
              
              mockShowtimes.push({
                id: i * 10 + index + 1,
                movieId: parseInt(id!),
                roomId: (index % 3) + 1,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                room: {
                  id: (index % 3) + 1,
                  name: `Phòng ${(index % 3) + 1}`,
                  capacity: 100,
                  cinemaId: 1
                }
              });
            });
          }
          
          setShowtimes(mockShowtimes);
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Có lỗi xảy ra khi tải thông tin phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

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
      navigate(`/booking/${movieId}?showtime=${showtimeId}`);
    } else {
      setIsBookingOpen(true);
    }
  };

  const handleBookingSuccess = (bookingId: number) => {
    setIsBookingOpen(false);
    navigate(`/booking-success/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <Link
            to="/movies"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Quay lại danh sách phim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/movies"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Quay lại danh sách phim
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Movie Poster */}
            <div className="md:w-1/3">
              <div className="aspect-[2/3] md:aspect-auto md:h-full">
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
            <div className="md:w-2/3 p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
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
                <p className="text-gray-600 leading-relaxed">{movie.description}</p>
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
        </div>

        {/* Showtimes */}
        {showtimes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
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
                        <div className="text-sm text-gray-500">Ngày chiếu</div>
                        <div className="font-semibold text-base text-ellipsis">
                          {new Date(showtime.startTime).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Giờ chiếu</div>
                        <div className="font-semibold text-lg text-ellipsis">
                          {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
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

        {/* Booking Sidebar */}
        <BookingSidebar
          movieId={movie?.id || null}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
    </div>
  );
};

export default MovieDetail;
