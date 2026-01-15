import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieAPI } from '../services/api';
import type { Movie } from '../types/movie';
import MovieCard from '../components/MovieCard';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import '../styles/app-theme.css';

const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');

  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep title stable
  const title = useMemo(() => {
    if (searchQuery) return `Kết quả tìm kiếm cho "${searchQuery}"`;
    if (selectedGenre) return `Phim thể loại ${selectedGenre}`;
    switch (category) {
      case 'now-showing':
        return 'Phim đang chiếu';
      case 'coming-soon':
        return 'Phim sắp chiếu';
      default:
        return 'Tất cả phim';
    }
  }, [searchQuery, selectedGenre, category]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        let response: any;

        if (searchQuery) {
          response = await movieAPI.search(searchQuery);
        } else if (selectedGenre) {
          response = await movieAPI.getByGenre(selectedGenre);
        } else if (category === 'now-showing') {
          response = await movieAPI.getNowShowing();
        } else if (category === 'coming-soon') {
          response = await movieAPI.getComingSoon();
        } else {
          response = await movieAPI.getAll(0, 20);
        }

        // Handle different response formats
        if ('state' in response && (response.state === '200' || response.state === 'SUCCESS') && response.object) {
          if (Array.isArray(response.object)) setMovies(response.object);
          else setMovies([]);
        } else if ('movies' in response && Array.isArray(response.movies)) {
          setMovies(response.movies);
        } else if ('content' in response && Array.isArray(response.content)) {
          setMovies(response.content);
        } else {
          setMovies([]);
          setError('Không thể tải danh sách phim');
        }
      } catch {
        setMovies([]);
        setError('Có lỗi xảy ra khi tải danh sách phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchQuery, category, selectedGenre]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response: any = await movieAPI.getGenres();
        if ((response.state === '200' || response.state === 'SUCCESS') && response.object) {
          setGenres(response.object);
        } else setGenres([]);
      } catch {
        setGenres([]);
      }
    };
    fetchGenres();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setSearchParams({ q });
      setCategory('all');
      setSelectedGenre('');
    } else {
      // nếu user xóa text rồi Enter → clear query param
      setSearchParams({});
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSearchQuery('');
    setSelectedGenre('');
    if (newCategory === 'all') setSearchParams({});
    else setSearchParams({ category: newCategory });
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    setCategory('all');
    setSearchParams({ genre });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setSelectedGenre('');
    setError(null);
    setShowFilters(false);
    setSearchParams({});
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) + (selectedGenre ? 1 : 0) + (category !== 'all' ? 1 : 0);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <BackdropLight />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Tìm nhanh phim bạn muốn xem, lọc theo thể loại và trạng thái chiếu.
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                <FunnelIcon className="h-5 w-5" />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-indigo-600 text-white text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="relative max-w-xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm phim theo tên…"
                className="w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-28 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Category Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'now-showing', label: 'Đang chiếu' },
              { key: 'coming-soon', label: 'Sắp chiếu' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleCategoryChange(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === tab.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Genre Filters Panel */}
          {showFilters && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-bold text-slate-900">Thể loại</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Đóng
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {genres.length === 0 ? (
                  <span className="text-sm text-slate-500">Chưa có danh sách thể loại.</span>
                ) : (
                  genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleGenreChange(genre)}
                      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                        selectedGenre === genre
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))
                )}
              </div>

              {(selectedGenre || category !== 'all' || searchQuery) && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">Đang áp dụng:</span>

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                      Từ khóa: <b>{searchQuery}</b>
                    </span>
                  )}
                  {category !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                      Danh mục: <b>{category === 'now-showing' ? 'Đang chiếu' : 'Sắp chiếu'}</b>
                    </span>
                  )}
                  {selectedGenre && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                      Thể loại: <b>{selectedGenre}</b>
                    </span>
                  )}

                  <button
                    onClick={clearFilters}
                    className="ml-auto inline-flex items-center gap-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="rounded-3xl border border-slate-200 bg-white/60 backdrop-blur p-4 sm:p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="flex items-center gap-3 text-slate-700">
                <span className="animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200 border-t-indigo-600" />
                <span className="text-sm">Đang tải danh sách phim…</span>
              </div>
            </div>
          ) : error ? (
            <ErrorState message={error} />
          ) : movies.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Tìm thấy <b className="text-slate-900">{movies.length}</b> phim
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {movies.map((movie) => (
                  <div key={movie.id} className="min-w-0 h-full">
                    <MovieCard movie={movie} showActions={true} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default Movies;

/* ---------------- helpers ---------------- */

const BackdropLight = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_10%,rgba(99,102,241,0.14),transparent_60%),radial-gradient(900px_600px_at_80%_20%,rgba(56,189,248,0.10),transparent_55%)]" />
    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:70px_70px]" />
    <div className="film-grain-light absolute inset-0 opacity-[0.10]" />
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-14">
    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-1">{message}</h3>
    <p className="text-slate-600">Vui lòng thử lại sau.</p>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-14">
    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-500">
      <MagnifyingGlassIcon className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy phim nào</h3>
    <p className="text-slate-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
  </div>
);
