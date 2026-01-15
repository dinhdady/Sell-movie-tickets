import React from 'react';
import { FilmIcon, ClockIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/outline';
import type { Movie } from '../types/movie';
interface MovieInfoCardProps {
  movie: Movie;
  showPoster?: boolean;
  compact?: boolean;
}
const MovieInfoCard: React.FC<MovieInfoCardProps> = ({ 
  movie, 
  showPoster = true, 
  compact = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOW_SHOWING':
        return 'bg-green-100 text-green-800';
      case 'COMING_SOON':
        return 'bg-yellow-100 text-yellow-800';
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
  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        {showPoster && (
          <div className="flex-shrink-0 h-12 w-8">
            {movie.posterUrl ? (
              <img
                className="h-12 w-8 object-cover rounded"
                src={movie.posterUrl}
                alt={movie.title}
              />
            ) : (
              <div className="h-12 w-8 bg-gray-200 rounded flex items-center justify-center">
                <FilmIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {movie.title}
          </div>
          <div className="text-xs text-gray-500">
            {movie.genre} • {movie.director}
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(movie.status)}`}>
            {getStatusText(movie.status)}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-md font-semibold text-gray-900 mb-3">Thông tin phim</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Poster and Title */}
        <div className="flex items-center space-x-3">
          {showPoster && (
            <div className="flex-shrink-0 h-16 w-12">
              {movie.posterUrl ? (
                <img
                  className="h-16 w-12 object-cover rounded"
                  src={movie.posterUrl}
                  alt={movie.title}
                />
              ) : (
                <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                  <FilmIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {movie.title}
            </div>
            <div className="text-sm text-gray-500">
              {(movie as any).language || 'N/A'}
            </div>
            {movie.rating > 0 && (
              <div className="flex items-center mt-1">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600">{movie.rating.toFixed(1)}/10</span>
              </div>
            )}
          </div>
        </div>
        {/* Genre */}
        <div>
          <div className="text-sm text-gray-600">Thể loại:</div>
          <div className="text-sm font-medium text-gray-900">{movie.genre}</div>
        </div>
        {/* Director */}
        <div>
          <div className="text-sm text-gray-600">Đạo diễn:</div>
          <div className="text-sm font-medium text-gray-900">{movie.director}</div>
        </div>
        {/* Duration */}
        <div>
          <div className="text-sm text-gray-600">Thời lượng:</div>
          <div className="text-sm font-medium text-gray-900 flex items-center">
            <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
            {movie.duration} phút
          </div>
        </div>
        {/* Release Date */}
        <div>
          <div className="text-sm text-gray-600">Ngày phát hành:</div>
          <div className="text-sm font-medium text-gray-900 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
            {formatDate(movie.releaseDate)}
          </div>
        </div>
        {/* Status */}
        <div>
          <div className="text-sm text-gray-600">Trạng thái:</div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(movie.status)}`}>
            {getStatusText(movie.status)}
          </span>
        </div>
        {/* Price */}
        <div>
          <div className="text-sm text-gray-600">Giá vé:</div>
          <div className="text-sm font-medium text-gray-900">
            {movie.price.toLocaleString('vi-VN')} VNĐ
          </div>
        </div>
        {/* Film Rating */}
        <div>
          <div className="text-sm text-gray-600">Độ tuổi:</div>
          <div className="text-sm font-medium text-gray-900">
            {movie.filmRating}
          </div>
        </div>
        {/* Cast */}
        {movie.cast && (
          <div className="md:col-span-2 lg:col-span-3">
            <div className="text-sm text-gray-600">Diễn viên:</div>
            <div className="text-sm font-medium text-gray-900 line-clamp-2">
              {movie.cast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default MovieInfoCard;
