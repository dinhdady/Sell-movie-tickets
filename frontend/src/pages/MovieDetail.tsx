import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/api';
import { ratingAPI } from '../services/ratingApi';
import type { Movie, Showtime } from '../types/movie';
import type { MovieRating } from '../types/rating';
import BookingSidebar from '../components/BookingSidebar';
import TrailerModal from '../components/TrailerModal';
import TrailerPlayer from '../components/TrailerPlayer';
import RatingForm from '../components/RatingForm';
import RatingList from '../components/RatingList';
import type { RatingStats } from '../types/rating';
import RatingStatsComponent from '../components/RatingStats';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../contexts/AuthContext';
import {
  ClockIcon,
  CalendarIcon,
  PlayIcon,
  MapPinIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

/**
 * UI/UX & CSS (Tailwind) refinements:
 * - 12-column grid layout; sticky poster column on desktop
 * - Softer cards (rounded-xl, ring, shadow) & consistent spacing
 * - Accessible buttons, clearer hierarchy, improved text wrapping
 * - Ratings section typography and pagination alignment
 */

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [showTrailerInline, setShowTrailerInline] = useState(false);

  // Rating states
  const [ratings, setRatings] = useState<MovieRating[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [userRating, setUserRating] = useState<MovieRating | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ratingsPerPage = 3;

  const loadRatings = useCallback(async () => {
    if (!id) return;
    try {
      setRatingLoading(true);
      const [ratingsData, statsData] = await Promise.all([
        ratingAPI.getMovieRatings(parseInt(id)),
        ratingAPI.getMovieRatingStats(parseInt(id)),
      ]);
      setRatings(ratingsData || []);
      setRatingStats(statsData);
      if (user) {
        const existingRating = ratingsData?.find((r) => r.userId === user.id);
        setUserRating(existingRating || null);
      }
    } catch (error) {
      setRatings([]);
      setRatingStats(null);
    } finally {
      setRatingLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id || isNaN(parseInt(id))) {
        setError('ID phim không hợp lệ');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const [movieResponse, showtimesResponse] = await Promise.all([
          movieAPI.getById(parseInt(id)),
          movieAPI.getShowtimes(parseInt(id)),
        ]);
        if (movieResponse && (movieResponse.state === 'SUCCESS' || movieResponse.state === '200') && movieResponse.object) {
          setMovie(movieResponse.object);
        } else {
          const mockMovie: Movie = {
            id: parseInt(id!),
            title: `Phim ID ${id}`,
            description:
              'Mô tả phim sẽ được tải từ server. Hiện đang sử dụng dữ liệu tạm thời.',
            duration: 120,
            releaseDate: '2024-01-15',
            genre: 'Hành Động, Phiêu Lưu',
            director: 'Chưa xác định',
            cast: 'Chưa xác định',
            rating: 8.0,
            status: 'NOW_SHOWING',
            filmRating: 'PG13',
            price: 80000,
            posterUrl:
              'http://res.cloudinary.com/dp9ltogc9/image/upload/v1752393509/Cinema/99998d7a-6.png',
          };
          setMovie(mockMovie);
        }

        if (showtimesResponse && (showtimesResponse.state === 'SUCCESS' || showtimesResponse.state === '200') && showtimesResponse.object) {
          setShowtimes(showtimesResponse.object);
        } else {
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
                  cinemaId: 1,
                },
              });
            });
          }
          setShowtimes(mockShowtimes);
        }
      } catch {
        setError('Có lỗi xảy ra khi tải thông tin phim');
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id, user, loadRatings]);

  useEffect(() => {
    if (id && !isNaN(parseInt(id))) {
      setRatings([]);
      setRatingStats(null);
      setUserRating(null);
      loadRatings();
    }
  }, [id, user?.id, loadRatings]);

  useEffect(() => {
    if (movie && movie.id) {
      setRatings([]);
      setRatingStats(null);
      setUserRating(null);
      loadRatings();
    }
  }, [movie?.id, user?.id, loadRatings, movie]);

  useEffect(() => {
    if (id && !isNaN(parseInt(id))) {
      setUserRating(null);
      loadRatings();
    }
  }, [user?.id, id, loadRatings]);

  const handleRatingSubmitted = (rating: MovieRating) => {
    setUserRating(rating);
    setShowRatingForm(false);
    setTimeout(() => {
      loadRatings();
    }, 500);
  };

  const handleCancelRating = () => {
    setShowRatingForm(false);
    setUserRating(null);
  };

  const handleRatingUpdate = () => {
    setCurrentPage(1);
    loadRatings();
  };

  const handleEditRating = (rating: MovieRating) => {
    setUserRating(rating);
    setShowRatingForm(true);
  };

  const totalPages = Math.ceil((ratings?.length || 0) / ratingsPerPage);
  const startIndex = (currentPage - 1) * ratingsPerPage;
  const endIndex = startIndex + ratingsPerPage;
  const currentRatings = ratings?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const ratingsSection = document.getElementById('ratings-section');
    if (ratingsSection) ratingsSection.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  const formatTime = (timeString: string) =>
    new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOW_SHOWING':
        return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200';
      case 'COMING_SOON':
        return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
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
    if (showtimeId) navigate(`/booking/${movieId}?showtime=${showtimeId}`);
    else setIsBookingOpen(true);
  };

  const handleBookingSuccess = (bookingId: number) => {
    setIsBookingOpen(false);
    navigate(`/booking-success/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-blue-600" />
          <span className="text-sm">Đang tải nội dung…</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{error}</h2>
          <Link to="/movies" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ChevronLeftIcon className="h-5 w-5" /> Quay lại danh sách phim
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link to="/movies" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeftIcon className="h-5 w-5 mr-1" /> Quay lại danh sách phim
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Poster column */}
          <aside className="md:col-span-4 lg:col-span-4">
            <div className="md:sticky md:top-24">
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                <div className="aspect-[2/3] bg-gray-100">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center">
                      <PlayIcon className="h-14 w-14 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3 bg-gray-50">
                  {movie.trailerUrl && (
                    <button
                      onClick={() => setIsTrailerOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-white bg-red-600 hover:bg-red-700 transition shadow-sm"
                    >
                      <PlayIcon className="h-5 w-5" />
                      <span>Xem trailer</span>
                    </button>
                  )}
                  {movie.status === 'NOW_SHOWING' && (
                    <button
                      onClick={() => navigate(`/booking/${movie.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
                    >
                      Đặt vé ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Content column */}
          <main className="md:col-span-8 lg:col-span-8 space-y-8">
            <section className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 mb-6">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-950 mb-2 line-clamp-2">
                    {movie.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(movie.status)}`}>
                      {getStatusText(movie.status)}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-xs md:text-sm font-semibold">
                      {movie.filmRating}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-xl md:text-3xl font-bold text-blue-600">
                    {movie.price.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              {/* Rating summary */}
              <div className="flex items-center gap-2 mb-6">
                <StarSolidIcon className="h-6 w-6 text-yellow-400" />
                <span className="text-lg md:text-xl font-semibold text-gray-900">
                  {movie.rating.toFixed(1)}
                </span>
                <span className="text-gray-600">/ 10</span>
              </div>

              {/* Meta grid */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{formatDate(movie.releaseDate)}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-3 text-gray-400">Thể loại:</span>
                  <span className="font-medium">{movie.genre}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-3 text-gray-400">Đạo diễn:</span>
                  <span className="font-medium">{movie.director}</span>
                </div>
              </dl>

              {/* Description */}
              <div className="prose prose-sm md:prose md:prose-gray max-w-none">
                <h3>Nội dung</h3>
                <p className="leading-7 text-gray-700">{movie.description}</p>
                <h3>Diễn viên</h3>
                <p className="leading-7 text-gray-700 break-words">{movie.cast}</p>
              </div>
            </section>

            {/* Ratings */}
            <section id="ratings-section" className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Đánh giá & Nhận xét</h3>
                {user && !userRating && (
                  <button
                    onClick={() => setShowRatingForm(true)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                  >
                    Viết đánh giá
                  </button>
                )}
              </div>

              {ratingStats && (
                <div className="mb-6">
                  <RatingStatsComponent stats={ratingStats} />
                </div>
              )}

              {ratingLoading && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600 mr-3" />
                  <span className="text-blue-700">Đang tải đánh giá…</span>
                </div>
              )}

              {showRatingForm && (
                <div className="mb-6">
                  <RatingForm
                    movieId={movie.id}
                    movieTitle={movie.title}
                    existingRating={userRating || undefined}
                    onRatingSubmitted={handleRatingSubmitted}
                    onCancel={handleCancelRating}
                  />
                </div>
              )}

              {userRating && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-blue-900">Đánh giá của bạn</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={userRating.rating} size="sm" />
                        <span className="text-sm text-blue-700">
                          {userRating.createdAt && new Date(userRating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {userRating.review && (
                        <p className="text-blue-800 mt-2 text-sm">{userRating.review}</p>
                      )}
                    </div>
                    <button onClick={() => handleEditRating(userRating)} className="text-blue-600 hover:text-blue-800 text-sm">
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              )}

              {/* Ratings list */}
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-900">Nhận xét từ khán giả</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {ratings?.length || 0} bình luận
                  </span>
                </div>

                {ratingLoading ? (
                  <div className="text-center py-8">
                    <span className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-3">Đang tải đánh giá…</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="min-h-[200px]">
                      <RatingList
                        ratings={currentRatings}
                        currentUserId={user?.id}
                        onRatingUpdate={handleRatingUpdate}
                        onEditRating={handleEditRating}
                      />
                    </div>

                    {totalPages > 1 && (
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm text-gray-600">
                            Hiển thị{' '}
                            <span className="font-medium text-gray-900">
                              {startIndex + 1}-{Math.min(endIndex, ratings?.length || 0)}
                            </span>{' '}
                            trong tổng số{' '}
                            <span className="font-medium text-gray-900">{ratings?.length || 0}</span> bình luận
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ← Trước
                            </button>
                            <div className="flex gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    currentPage === page
                                      ? 'bg-blue-600 text-white shadow'
                                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Sau →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Trailer inline */}
            {movie?.trailerUrl && showTrailerInline && (
              <section className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Trailer</h2>
                  <button onClick={() => setShowTrailerInline(false)} className="text-gray-500 hover:text-gray-700">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <TrailerPlayer trailerUrl={movie.trailerUrl} movieTitle={movie.title} />
              </section>
            )}

            {/* Showtimes */}
            {showtimes.length > 0 && (
              <section className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch chiếu</h2>
                <div className="space-y-4">
                  {showtimes.map((showtime) => (
                    <div key={showtime.id} className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
                          <div className="flex items-center text-gray-700">
                            <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="truncate max-w-[180px] sm:max-w-none">{showtime.room?.name || 'Phòng chiếu'}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{showtime.room?.capacity || 0} ghế</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Ngày chiếu</div>
                            <div className="font-semibold">
                              {new Date(showtime.startTime).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Giờ chiếu</div>
                            <div className="font-semibold text-base">
                              {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                            </div>
                          </div>
                          {movie.status === 'NOW_SHOWING' && (
                            <button
                              onClick={() => handleBookTicket(movie.id, showtime.id)}
                              className="whitespace-nowrap px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                              Chọn ghế
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>

        {/* Booking Sidebar */}
        <BookingSidebar
          movieId={movie?.id || null}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />

        {/* Trailer Modal */}
        {movie?.trailerUrl && (
          <TrailerModal
            isOpen={isTrailerOpen}
            onClose={() => setIsTrailerOpen(false)}
            trailerUrl={movie.trailerUrl}
            movieTitle={movie.title}
          />
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
