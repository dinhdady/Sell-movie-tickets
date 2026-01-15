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

import '../styles/app-theme.css';

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

        if (nowShowingResponse && (nowShowingResponse.state === '200' || nowShowingResponse.state === 'SUCCESS') && nowShowingResponse.object) {
          setNowShowingMovies(nowShowingResponse.object);
          if (nowShowingResponse.object.length > 0) setFeaturedMovie(nowShowingResponse.object[0]);
        } else {
          setNowShowingMovies([]);
        }

        if (comingSoonResponse && (comingSoonResponse.state === '200' || comingSoonResponse.state === 'SUCCESS') && comingSoonResponse.object) {
          setComingSoonMovies(comingSoonResponse.object);
        } else {
          setComingSoonMovies([]);
        }
      } catch (err: any) {
        console.error('Error fetching movies:', err);
        setError(err.response?.data?.message || err.message || 'Không thể tải danh sách phim. Vui lòng thử lại.');
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
      <div className="relative min-h-screen bg-slate-50 text-slate-900 grid place-items-center">
        <BackdropLight />
        <div className="relative rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700">
            <span className="animate-spin rounded-full h-7 w-7 border-[3px] border-slate-200 border-t-indigo-600" />
            <span className="text-sm">Đang tải nội dung…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-900 grid place-items-center px-4">
        <BackdropLight />
        <div className="relative w-full max-w-md rounded-3xl border border-red-200 bg-white/85 backdrop-blur p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-red-700">Lỗi kết nối</h3>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <BackdropLight />

      {/* HERO (poster + card trắng) */}
      {featuredMovie && (
        <section className="relative">
          <div className="relative h-[56vh] min-h-[520px] overflow-hidden">
            <div className="absolute inset-0">
              {featuredMovie.posterUrl ? (
                <img src={featuredMovie.posterUrl} alt={featuredMovie.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-indigo-600 to-sky-600" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 h-full flex items-end">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10">
                <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 sm:p-8 shadow-[0_20px_60px_-30px_rgba(2,6,23,0.18)]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Featured • {featuredMovie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                  </div>

                  <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    {featuredMovie.title}
                  </h1>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 line-clamp-3">
                    {featuredMovie.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-slate-700">
                    <PillLight>
                      <StarSolidIcon className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{(featuredMovie.rating ?? 0).toFixed(1)}</span>
                    </PillLight>

                    {featuredMovie.releaseDate && (
                      <PillLight>
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(featuredMovie.releaseDate)}</span>
                      </PillLight>
                    )}

                    {typeof featuredMovie.duration === 'number' && (
                      <PillLight>
                        <ClockIcon className="h-4 w-4" />
                        <span>{Math.floor(featuredMovie.duration / 60)}h {featuredMovie.duration % 60}m</span>
                      </PillLight>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    {featuredMovie.status === 'NOW_SHOWING' ? (
                      <Link
                        to={`/booking/${featuredMovie.id}`}
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white
                                   bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                      >
                        Đặt vé ngay
                      </Link>
                    ) : (
                      <Link
                        to={`/movies/${featuredMovie.id}`}
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white
                                   bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                      >
                        Xem chi tiết
                      </Link>
                    )}

                    {featuredMovie.status === 'NOW_SHOWING' && (
                      <Link
                        to={`/movies/${featuredMovie.id}`}
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-slate-800
                                   border border-slate-300 bg-white hover:bg-slate-50 transition"
                      >
                        Xem chi tiết
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* NOW SHOWING */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeaderRow
            title="Phim đang chiếu"
            subtitle="Chọn phim hot và đặt vé nhanh trong vài bước"
            to="/movies?category=now-showing"
          />

          {nowShowingMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {nowShowingMovies.slice(0, 10).map((movie) => (
                <div key={movie.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyStateLight icon="screen" title="Chưa có phim đang chiếu" subtitle="Hãy quay lại sau để xem những bộ phim mới nhất!" />
          )}
        </div>
      </section>

      {/* COMING SOON */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeaderRow
            title="Phim sắp chiếu"
            subtitle="Đón chờ những bom tấn sắp ra mắt"
            to="/movies?category=coming-soon"
          />

          {comingSoonMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {comingSoonMovies.slice(0, 10).map((movie) => (
                <div key={movie.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
                  <MovieCard movie={movie} showActions={false} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyStateLight icon="clock" title="Chưa có phim sắp chiếu" subtitle="Những bộ phim hấp dẫn sẽ sớm ra mắt!" />
          )}
        </div>
      </section>

      {/* FEATURES (clean) */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-8 sm:p-10 shadow-sm">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900">
                Tại sao chọn <span className="text-indigo-600">CinemaHub</span>?
              </h2>
              <p className="mt-2 text-slate-600 text-lg">Trải nghiệm xem phim tuyệt vời với công nghệ hiện đại</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCardLight
                Icon={PlayIcon}
                title="Chất lượng cao"
                desc="Âm thanh và hình ảnh sống động, tối ưu trải nghiệm."
              />
              <FeatureCardLight
                Icon={StarIcon}
                title="Ghế thoải mái"
                desc="Chọn ghế dễ dàng, hỗ trợ ghế VIP/đôi tuỳ rạp."
              />
              <FeatureCardLight
                Icon={CalendarIcon}
                title="Đặt vé dễ dàng"
                desc="Đặt vé online 24/7, thanh toán nhanh và nhận vé điện tử."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-10" />
    </div>
  );
};

export default Home;

/* ---------------- helpers ---------------- */

const BackdropLight = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_10%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(900px_600px_at_80%_20%,rgba(56,189,248,0.10),transparent_55%)]" />
    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:70px_70px]" />
    <div className="film-grain-light absolute inset-0 opacity-[0.10]" />
  </div>
);

const PillLight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-700">
    {children}
  </div>
);

const HeaderRow: React.FC<{ title: string; subtitle: string; to: string }> = ({ title, subtitle, to }) => (
  <div className="flex items-end justify-between gap-4 mb-7">
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </div>
    <Link to={to} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold">
      Xem tất cả <ChevronRightIcon className="h-5 w-5" />
    </Link>
  </div>
);

type EmptyStateProps = { icon: 'screen' | 'clock'; title: string; subtitle: string };
const EmptyStateLight: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <div className="text-center py-12">
    <div className="bg-white/80 backdrop-blur rounded-3xl p-8 max-w-md mx-auto border border-slate-200 shadow-sm">
      <div className="text-slate-400 mb-4">
        {icon === 'screen' ? (
          <svg className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{subtitle}</p>
    </div>
  </div>
);

type FeatureCardProps = { Icon: React.ElementType; title: string; desc: string };
const FeatureCardLight: React.FC<FeatureCardProps> = ({ Icon, title, desc }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition">
    <div className="bg-indigo-600/10 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4 ring-1 ring-indigo-600/15">
      <Icon className="h-7 w-7 text-indigo-700" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-slate-600">{desc}</p>
  </div>
);
