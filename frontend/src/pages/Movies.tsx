import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/api';
import type { Movie } from '../types/movie';
import MovieCard from '../components/MovieCard';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;

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
        if ('state' in response && response.state === '200' && response.object) {
          // ResponseObject format
          if (Array.isArray(response.object)) {
            setMovies(response.object);
          } else {
            setMovies([]);
          }
        } else if ('movies' in response && Array.isArray(response.movies)) {
          // PaginatedResponse format
          setMovies(response.movies);
        } else if ('content' in response && Array.isArray(response.content)) {
          // Alternative paginated response format
          setMovies(response.content);
        } else {
          console.warn('Movies response:', response);
          setMovies([]);
          setError('Không thể tải danh sách phim');
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
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
        const response = await movieAPI.getGenres();
        if (response.state === '200' && response.object) {
          setGenres(response.object);
        } else {
          console.warn('Genres response:', response);
          setGenres([]);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        setGenres([]);
      }
    };

    fetchGenres();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setCategory('all');
      setSelectedGenre('');
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSearchQuery('');
    setSelectedGenre('');
    if (newCategory === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: newCategory });
    }
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
    setSearchParams({});
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const getCategoryTitle = () => {
    if (searchQuery) return `Kết quả tìm kiếm cho "${searchQuery}"`;
    if (selectedGenre) return `Phim thể loại ${selectedGenre}`;
    switch (category) {
      case 'now-showing': return 'Phim đang chiếu';
      case 'coming-soon': return 'Phim sắp chiếu';
      default: return 'Tất cả phim';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {getCategoryTitle()}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm phim..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Bộ lọc
            </button>

            {/* Category Tabs */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'now-showing', label: 'Đang chiếu' },
                { key: 'coming-soon', label: 'Sắp chiếu' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleCategoryChange(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    category === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {(searchQuery || selectedGenre || category !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="h-5 w-5 mr-1" />
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Genre Filters */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Thể loại</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreChange(genre)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedGenre === genre
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Movies Grid */}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error}
            </h3>
            <p className="text-gray-500">
              Vui lòng thử lại sau
            </p>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} onClick={() => handleMovieClick(movie.id)} className="cursor-pointer min-w-0">
                <MovieCard movie={movie} showActions={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy phim nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
