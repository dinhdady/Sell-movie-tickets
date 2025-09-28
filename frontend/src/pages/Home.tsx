import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI } from '../services/api';
import type { Movie } from '../types/movie';
import MovieCard from '../components/MovieCard';
import { 
  PlayIcon, 
  StarIcon,
  CalendarIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

/**
 * Home — polished cinema theme
 * - Cinematic hero with gradient overlay and safe text zone
 * - Unified spacing, typography, and buttons
 * - Responsive grids with nicer empty states
 * - Consistent brand section in blue gradient
 */

const Home: React.FC = () => {
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const [nowShowingResponse, comingSoonResponse] = await Promise.all([
          movieAPI.getNowShowing(),
          movieAPI.getComingSoon(),
        ]);
        if (nowShowingResponse.state === '200' && nowShowingResponse.object) {
          setNowShowingMovies(nowShowingResponse.object);
          if (nowShowingResponse.object.length > 0) {
            setFeaturedMovie(nowShowingResponse.object[0]);
          }
        } else {
          setNowShowingMovies([]);
        }
        if (comingSoonResponse.state === '200' && comingSoonResponse.object) {
          setComingSoonMovies(comingSoonResponse.object);
        } else {
          setComingSoonMovies([]);
        }
      } catch (error) {
        setError('Không thể tải danh sách phim. Vui lòng kiểm tra kết nối mạng và thử lại.');
        setNowShowingMovies([]);
        setComingSoonMovies([]);
        setFeaturedMovie(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200 border-t-indigo-600" />
          <span className="text-sm">Đang tải nội dung…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-1">Lỗi kết nối</h3>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      {featuredMovie && (
        <section className="relative h-[68vh] min-h-[520px] max-h-[760px] overflow-hidden">
          <div className="absolute inset-0">
            {featuredMovie.posterUrl ? (
              <img src={featuredMovie.posterUrl} alt={featuredMovie.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-indigo-700 to-blue-800" />
            )}
            {/* Gradient overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-slate-900/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm mb-4">
                  {featuredMovie.title}
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-slate-100/90 mb-6 line-clamp-3">
                  {featuredMovie.description}
                </p>
                <div className="flex flex-wrap items-center gap-5 mb-8 text-slate-100">
                  <div className="inline-flex items-center">
                    <StarSolidIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="font-semibold">{featuredMovie.rating.toFixed(1)}</span>
                  </div>
                  <div className="inline-flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>{formatDate(featuredMovie.releaseDate)}</span>
                  </div>
                  <div className="inline-flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>
                      {Math.floor(featuredMovie.duration / 60)}h {featuredMovie.duration % 60}m
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {featuredMovie.status === 'NOW_SHOWING' ? (
                    <Link
                      to={`/booking/${featuredMovie.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-indigo-700 transition"
                    >
                      Đặt vé ngay
                    </Link>
                  ) : (
                    <Link
                      to={`/movies/${featuredMovie.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-indigo-700 transition"
                    >
                      Xem chi tiết
                    </Link>
                  )}

                  {featuredMovie.status === 'NOW_SHOWING' && (
                    <Link
                      to={`/movies/${featuredMovie.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-white/90 px-6 py-3 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-200 hover:bg-white transition"
                    >
                      Xem chi tiết
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Now Showing */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Phim đang chiếu</h2>
            <Link to="/movies?category=now-showing" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium">
              Xem tất cả <ChevronRightIcon className="h-5 w-5" />
            </Link>
          </div>

          {nowShowingMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {nowShowingMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <EmptyState icon="screen" title="Chưa có phim đang chiếu" subtitle="Hãy quay lại sau để xem những bộ phim mới nhất!" />
          )}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Phim sắp chiếu</h2>
            <Link to="/movies?category=coming-soon" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium">
              Xem tất cả <ChevronRightIcon className="h-5 w-5" />
            </Link>
          </div>

          {comingSoonMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {comingSoonMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} showActions={false} />
              ))}
            </div>
          ) : (
            <EmptyState icon="clock" title="Chưa có phim sắp chiếu" subtitle="Những bộ phim hấp dẫn sẽ sớm ra mắt!" />
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Tại sao chọn CinemaHub?</h2>
            <p className="text-indigo-100 text-lg">Trải nghiệm xem phim tuyệt vời với công nghệ hiện đại</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              Icon={PlayIcon}
              title="Chất lượng cao"
              desc="Hệ thống âm thanh và hình ảnh 4K, IMAX mang đến trải nghiệm sống động"
            />
            <FeatureCard
              Icon={StarIcon}
              title="Ghế thoải mái"
              desc="Ghế VIP với chức năng massage, điều chỉnh độ nghiêng tối ưu"
            />
            <FeatureCard
              Icon={CalendarIcon}
              title="Đặt vé dễ dàng"
              desc="Đặt vé online 24/7, thanh toán an toàn, nhận vé qua email/SMS"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

// ------- Small presentational helpers (same file for convenience) -------

type EmptyStateProps = { icon: 'screen' | 'clock'; title: string; subtitle: string };
const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => {
  return (
    <div className="text-center py-16">
      <div className="bg-slate-100 rounded-2xl p-8 max-w-md mx-auto">
        <div className="text-slate-400 mb-4">
          {icon === 'screen' ? (
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
};

type FeatureCardProps = { Icon: React.ElementType; title: string; desc: string };
const FeatureCard: React.FC<FeatureCardProps> = ({ Icon, title, desc }) => {
  return (
    <div className="text-center text-white">
      <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ring-1 ring-white/30">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-indigo-100">{desc}</p>
    </div>
  );
};