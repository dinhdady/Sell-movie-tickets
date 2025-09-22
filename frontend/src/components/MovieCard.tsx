import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Movie, Showtime } from '../types/movie';
import { useCart } from '../contexts/CartContext';
import { 
  ClockIcon, 
  CalendarIcon, 
  FilmIcon,
  PlayIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
interface MovieCardProps {
  movie: Movie;
  showActions?: boolean;
}
const MovieCard: React.FC<MovieCardProps> = ({ movie, showActions = true }) => {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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
  const getFilmRatingColor = (rating: string) => {
    switch (rating) {
      case 'G':
        return 'bg-green-500';
      case 'PG':
        return 'bg-yellow-500';
      case 'PG13':
        return 'bg-orange-500';
      case 'R':
        return 'bg-red-500';
      case 'NC17':
        return 'bg-red-700';
      default:
        return 'bg-gray-500';
    }
  };
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      // Tạo showtime mặc định (sẽ được chọn lại trong booking page)
      const defaultShowtime: Showtime = {
        id: 0, // Temporary ID
        movieId: movie.id,
        roomId: 0, // Will be selected later
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };
      // Tạo item để thêm vào giỏ hàng
      const cartItem = {
        movie,
        showtime: defaultShowtime,
        seats: [], // Để trống, sẽ chọn ghế sau khi vào trang booking
        quantity: 1,
        totalPrice: movie.price
      };
      addToCart(cartItem);
      // Thêm vào giỏ hàng thành công - không hiển thị thông báo
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="movie-card card-hover group min-w-0 h-full flex flex-col">
      {/* Movie Poster */}
      <Link to={`/movies/${movie.id}`} className="relative aspect-[2/3] overflow-hidden flex-shrink-0 block">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FilmIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movie.status)}`}>
            {getStatusText(movie.status)}
          </span>
        </div>
        {/* Film Rating Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getFilmRatingColor(movie.filmRating)}`}>
            {movie.filmRating}
          </span>
        </div>
        {/* Play Button Overlay */}
        {movie.trailerUrl && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100">
              <PlayIcon className="h-8 w-8 text-gray-800" />
            </div>
          </div>
        )}
      </Link>
      {/* Movie Info */}
      <div className="p-4 min-w-0 flex flex-col flex-1">
        {/* Movie Title - Fixed height */}
        <div className="h-14 mb-2 flex items-start">
          <Link to={`/movies/${movie.id}`} className="block">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 break-words leading-tight hover:text-blue-600 transition-colors">
              {movie.title}
            </h3>
          </Link>
        </div>
        {/* Movie Description - Fixed height */}
        <div className="h-10 mb-3">
          <p className="text-gray-600 text-sm line-clamp-2 break-words leading-tight">
            {movie.description}
          </p>
        </div>
        {/* Movie Details - Fixed height */}
        <div className="space-y-1 mb-4 flex-shrink-0">
          <div className="flex items-center text-sm text-gray-500 min-w-0 h-5">
            <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatDuration(movie.duration)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 min-w-0 h-5">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatDate(movie.releaseDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 min-w-0 h-5">
            <span className="mr-2 flex-shrink-0 text-xs">Thể loại:</span>
            <span className="font-medium truncate text-xs">{movie.genre}</span>
          </div>
        </div>
        {/* Rating and Price - Fixed height */}
        <div className="flex items-center justify-between mb-4 min-w-0 h-6 flex-shrink-0">
          <div className="flex items-center flex-1 min-w-0">
            <StarSolidIcon className="h-4 w-4 text-yellow-400 mr-1 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate">
              {movie.rating.toFixed(1)}
            </span>
          </div>
          <div className="text-base font-bold text-blue-600 flex-shrink-0 ml-2">
            <span className="truncate">{movie.price.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
        {/* Actions - Fixed at bottom */}
        {showActions && (
          <div className="flex space-x-2 min-w-0 mt-auto">
            {movie.status === 'NOW_SHOWING' ? (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className={`flex items-center justify-center p-2 rounded-lg transition-colors text-white ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  title={isLoading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                >
                  <ShoppingCartIcon className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
                </button>
                <Link
                  to={`/movies/${movie.id}`}
                  className="btn-primary flex-1 text-center form-element py-2 px-3 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="truncate">Mua ngay</span>
                </Link>
              </>
            ) : movie.status === 'COMING_SOON' ? (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className={`flex items-center justify-center p-2 rounded-lg transition-colors text-white ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                  title={isLoading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                >
                  <ShoppingCartIcon className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
                </button>
                <Link
                  to={`/movies/${movie.id}`}
                  className="btn-primary flex-1 text-center form-element py-2 px-3 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="truncate">Xem chi tiết</span>
                </Link>
              </>
            ) : (
              // Phim đã kết thúc - chỉ hiển thị nút xem chi tiết
              <Link
                to={`/movies/${movie.id}`}
                className="btn-primary flex-1 text-center form-element py-2 px-3 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="truncate">Xem chi tiết</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default MovieCard;
