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
        
        // Fetch from API
        const [nowShowingResponse, comingSoonResponse] = await Promise.all([
          movieAPI.getNowShowing(),
          movieAPI.getComingSoon()
        ]);

        console.log('Now showing response:', nowShowingResponse);
        console.log('Coming soon response:', comingSoonResponse);

        if (nowShowingResponse.state === '200' && nowShowingResponse.object) {
          setNowShowingMovies(nowShowingResponse.object);
          // Set first movie as featured
          if (nowShowingResponse.object.length > 0) {
            setFeaturedMovie(nowShowingResponse.object[0]);
          }
        } else {
          console.warn('Now showing movies response:', nowShowingResponse);
          setNowShowingMovies([]);
        }

        if (comingSoonResponse.state === '200' && comingSoonResponse.object) {
          setComingSoonMovies(comingSoonResponse.object);
        } else {
          console.warn('Coming soon movies response:', comingSoonResponse);
          setComingSoonMovies([]);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg max-w-md">
            <h3 className="font-semibold mb-2">Lỗi kết nối</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            {featuredMovie.posterUrl ? (
              <img
                src={featuredMovie.posterUrl}
                alt={featuredMovie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
          
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {featuredMovie.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-3">
                  {featuredMovie.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 mb-8">
                  <div className="flex items-center text-white">
                    <StarSolidIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="font-semibold">{featuredMovie.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>{formatDate(featuredMovie.releaseDate)}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>{Math.floor(featuredMovie.duration / 60)}h {featuredMovie.duration % 60}m</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {featuredMovie.status === 'NOW_SHOWING' ? (
                    <Link
                      to={`/booking/${featuredMovie.id}`}
                      className="btn-primary px-8 py-3 text-center"
                    >
                      Thêm vào giỏ hàng
                    </Link>
                  ) : (
                    <Link
                      to={`/movies/${featuredMovie.id}`}
                      className="btn-primary px-8 py-3 text-center"
                    >
                      Xem chi tiết
                    </Link>
                  )}
                  {featuredMovie.status === 'NOW_SHOWING' && (
                    <Link
                      to={`/movies/${featuredMovie.id}`}
                      className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-center border-2 border-blue-600"
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

      {/* Now Showing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Phim đang chiếu</h2>
            <Link
              to="/movies?category=now-showing"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem tất cả
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          {nowShowingMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nowShowingMovies.slice(0, 8).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có phim đang chiếu</h3>
                <p className="text-gray-500">Hãy quay lại sau để xem những bộ phim mới nhất!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Phim sắp chiếu</h2>
            <Link
              to="/movies?category=coming-soon"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem tất cả
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          {comingSoonMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {comingSoonMovies.slice(0, 8).map((movie) => (
                <MovieCard key={movie.id} movie={movie} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có phim sắp chiếu</h3>
                <p className="text-gray-500">Những bộ phim hấp dẫn sẽ sớm ra mắt!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Tại sao chọn CinemaHub?
            </h2>
            <p className="text-xl text-blue-100">
              Trải nghiệm xem phim tuyệt vời với công nghệ hiện đại
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center text-white">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PlayIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng cao</h3>
              <p className="text-blue-100">
                Hệ thống âm thanh và hình ảnh 4K, IMAX mang đến trải nghiệm sống động
              </p>
            </div>
            
            <div className="text-center text-white">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ghế thoải mái</h3>
              <p className="text-blue-100">
                Ghế VIP với chức năng massage, điều chỉnh độ nghiêng tối ưu
              </p>
            </div>
            
            <div className="text-center text-white">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Đặt vé dễ dàng</h3>
              <p className="text-blue-100">
                Đặt vé online 24/7, thanh toán an toàn, nhận vé qua email/SMS
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
