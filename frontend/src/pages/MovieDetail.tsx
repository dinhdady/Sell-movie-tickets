import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/api';
import { ratingAPI } from '../services/ratingApi';
import type { Movie, Showtime } from '../types/movie';
import type { MovieRating, RatingStats } from '../types/rating';
import BookingSidebar from '../components/BookingSidebar';
import TrailerModal from '../components/TrailerModal';
import TrailerPlayer from '../components/TrailerPlayer';
import RatingForm from '../components/RatingForm';
import RatingList from '../components/RatingList';
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

import '../styles/app-theme.css';

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
      const mid = parseInt(id);
      const [ratingsData, statsData] = await Promise.all([
        ratingAPI.getMovieRatings(mid),
        ratingAPI.getMovieRatingStats(mid),
      ]);
      setRatings(ratingsData || []);
      setRatingStats(statsData || null);

      if (user && ratingsData?.length) {
        const existingRating = ratingsData.find((r) => r.userId === user.id);
        setUserRating(existingRating || null);
      } else {
        setUserRating(null);
      }
    } catch {
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
        const mid = parseInt(id);
        const [movieResponse, showtimesResponse] = await Promise.all([
          movieAPI.getById(mid),
          movieAPI.getShowtimes(mid),
        ]);

        if (movieResponse && (movieResponse.state === 'SUCCESS' || movieResponse.state === '200') && movieResponse.object) {
          setMovie(movieResponse.object);
        } else {
          setError('Không tìm thấy thông tin phim');
          setMovie(null);
        }

        if (showtimesResponse && (showtimesResponse.state === 'SUCCESS' || showtimesResponse.state === '200') && showtimesResponse.object) {
          setShowtimes(showtimesResponse.object);
        } else {
          setShowtimes([]);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải thông tin phim');
        setMovie(null);
        setShowtimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (id && !isNaN(parseInt(id))) loadRatings();
  }, [id, user?.id, loadRatings]);

  const handleRatingSubmitted = (rating: MovieRating) => {
    setUserRating(rating);
    setShowRatingForm(false);
    setTimeout(() => loadRatings(), 500);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOW_SHOWING':
        return { text: 'Đang chiếu', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'COMING_SOON':
        return { text: 'Sắp chiếu', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'ENDED':
        return { text: 'Kết thúc', cls: 'bg-slate-50 text-slate-700 border-slate-200' };
      default:
        return { text: status, cls: 'bg-slate-50 text-slate-700 border-slate-200' };
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
      <div className="relative min-h-screen bg-slate-50 text-slate-900 grid place-items-center">
        <BackdropLight />
        <div className="relative rounded-2xl border border-slate-200 bg-white/85 backdrop-blur px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700">
            <span className="animate-spin rounded-full h-7 w-7 border-[3px] border-slate-200 border-t-indigo-600" />
            <span className="text-sm">Đang tải nội dung…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-900 grid place-items-center px-4">
        <BackdropLight />
        <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 shadow-sm text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">{error || 'Không tìm thấy thông tin phim'}</h2>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            <ChevronLeftIcon className="h-5 w-5" /> Quay lại danh sách phim
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(movie.status);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <BackdropLight />

      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/75 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/movies" className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeftIcon className="h-5 w-5 mr-1" /> Quay lại danh sách phim
          </Link>

          {/* small actions */}
          <div className="hidden sm:flex items-center gap-2">
            {movie.trailerUrl && (
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <PlayIcon className="h-4 w-4" />
                Trailer
              </button>
            )}
            {movie.status === 'NOW_SHOWING' && (
              <button
                onClick={() => navigate(`/booking/${movie.id}`)}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
              >
                Đặt vé
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Poster column */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[2/3] bg-slate-100">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center">
                      <PlayIcon className="h-14 w-14 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
                      <StarSolidIcon className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{(movie.rating ?? 0).toFixed(1)}</span>
                      <span className="text-slate-400">/10</span>
                    </div>

                    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${status.cls}`}>
                      {status.text}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700">
                      {movie.filmRating}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-slate-500">Giá vé từ</div>
                    <div className="text-2xl font-extrabold text-indigo-700">
                      {movie.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {movie.trailerUrl && (
                      <button
                        onClick={() => setIsTrailerOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold
                                   border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition"
                      >
                        <PlayIcon className="h-5 w-5" />
                        Xem trailer
                      </button>
                    )}

                    {movie.status === 'NOW_SHOWING' && (
                      <button
                        onClick={() => navigate(`/booking/${movie.id}`)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold
                                   bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                      >
                        Đặt vé ngay
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* quick meta */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-slate-400" />
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                    <span className="truncate">{formatDate(movie.releaseDate)}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-slate-400">Thể loại:</span>
                    <span className="font-semibold">{movie.genre}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-slate-400">Đạo diễn:</span>
                    <span className="font-semibold">{movie.director}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Content column */}
          <main className="lg:col-span-8 space-y-8">
            {/* Main info */}
            <section className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950 line-clamp-2">
                    {movie.title}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${status.cls}`}>
                      {status.text}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700">
                      {movie.filmRating}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
                      <StarSolidIcon className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">{(movie.rating ?? 0).toFixed(1)}</span>
                      <span className="text-slate-400 ml-1">/10</span>
                    </span>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-500">Giá vé từ</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-indigo-700">
                    {movie.price.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Nội dung</h3>
                  <p className="mt-2 text-slate-600 leading-7">{movie.description}</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Diễn viên</h3>
                  <p className="mt-2 text-slate-600 leading-7 break-words">{movie.cast}</p>
                </div>
              </div>

              {/* inline trailer toggle */}
              {movie.trailerUrl && (
                <div className="mt-8">
                  {!showTrailerInline ? (
                    <button
                      onClick={() => setShowTrailerInline(true)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      <PlayIcon className="h-5 w-5" />
                      Xem trailer ngay tại trang
                    </button>
                  ) : null}
                </div>
              )}
            </section>

            {/* Trailer inline */}
            {movie.trailerUrl && showTrailerInline && (
              <section className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Trailer</h2>
                  <button onClick={() => setShowTrailerInline(false)} className="text-slate-500 hover:text-slate-700">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <TrailerPlayer trailerUrl={movie.trailerUrl} movieTitle={movie.title} />
              </section>
            )}

            {/* Showtimes */}
            {showtimes.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Lịch chiếu</h2>
                <div className="space-y-3">
                  {showtimes.map((showtime) => (
                    <div
                      key={showtime.id}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
                          <div className="flex items-center text-slate-700">
                            <MapPinIcon className="h-5 w-5 mr-2 text-slate-400" />
                            <span className="truncate max-w-[220px] sm:max-w-none">
                              {showtime.room?.name || 'Phòng chiếu'}
                            </span>
                          </div>
                          <div className="flex items-center text-slate-700">
                            <UserGroupIcon className="h-5 w-5 mr-2 text-slate-400" />
                            <span>{showtime.room?.capacity || 0} ghế</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xs text-slate-500">Ngày chiếu</div>
                            <div className="font-semibold">
                              {new Date(showtime.startTime).toLocaleDateString('vi-VN')}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-xs text-slate-500">Giờ chiếu</div>
                            <div className="font-semibold">
                              {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                            </div>
                          </div>

                          {movie.status === 'NOW_SHOWING' && (
                            <button
                              onClick={() => handleBookTicket(movie.id, showtime.id)}
                              className="whitespace-nowrap rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
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

            {/* Ratings */}
            <section id="ratings-section" className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Đánh giá & Nhận xét</h3>

                {user && !userRating && (
                  <button
                    onClick={() => setShowRatingForm(true)}
                    className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
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
                <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 flex items-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-200 border-t-indigo-600 mr-3" />
                  <span className="text-indigo-700 text-sm">Đang tải đánh giá…</span>
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
                <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-indigo-900">Đánh giá của bạn</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={userRating.rating} size="sm" />
                        <span className="text-sm text-indigo-700">
                          {userRating.createdAt && new Date(userRating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {userRating.review && (
                        <p className="text-indigo-800 mt-2 text-sm leading-6">{userRating.review}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditRating(userRating)}
                      className="text-indigo-700 hover:text-indigo-900 text-sm font-semibold"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              )}

              {/* Ratings list container */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-slate-900">Nhận xét từ khán giả</h4>
                  <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-semibold">
                    {ratings?.length || 0} bình luận
                  </span>
                </div>

                {ratingLoading ? (
                  <div className="text-center py-10">
                    <span className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600 mx-auto block" />
                    <p className="text-slate-500 mt-3">Đang tải đánh giá…</p>
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
                      <div className="border-t border-slate-200 pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm text-slate-600">
                            Hiển thị{' '}
                            <span className="font-semibold text-slate-900">
                              {startIndex + 1}-{Math.min(endIndex, ratings?.length || 0)}
                            </span>{' '}
                            trong tổng số{' '}
                            <span className="font-semibold text-slate-900">{ratings?.length || 0}</span> bình luận
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ← Trước
                            </button>

                            <div className="flex gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-3.5 py-2.5 text-sm font-semibold rounded-2xl transition ${
                                    currentPage === page
                                      ? 'bg-indigo-600 text-white shadow-sm'
                                      : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

/* ---------------- helpers ---------------- */

const BackdropLight = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_10%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(900px_600px_at_80%_20%,rgba(56,189,248,0.10),transparent_55%)]" />
    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:70px_70px]" />
    <div className="film-grain-light absolute inset-0 opacity-[0.10]" />
  </div>
);
