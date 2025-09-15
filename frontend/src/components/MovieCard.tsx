import React from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types/movie';
import { 
  ClockIcon, 
  CalendarIcon, 
  FilmIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface MovieCardProps {
  movie: Movie;
  showActions?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, showActions = true }) => {
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

  return (
    <div className="movie-card card-hover group min-w-0">
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100">
              <PlayIcon className="h-8 w-8 text-gray-800" />
            </button>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4 min-w-0">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 break-words">
          {movie.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">
          {movie.description}
        </p>

        {/* Movie Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500 min-w-0">
            <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-ellipsis">{formatDuration(movie.duration)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 min-w-0">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-ellipsis">{formatDate(movie.releaseDate)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 min-w-0">
            <span className="mr-2 flex-shrink-0">Thể loại:</span>
            <span className="font-medium text-ellipsis">{movie.genre}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4 min-w-0">
          <div className="flex items-center flex-1 min-w-0">
            <StarSolidIcon className="h-4 w-4 text-yellow-400 mr-1 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 text-ellipsis">
              {movie.rating.toFixed(1)}
            </span>
          </div>
          <div className="text-lg font-bold text-blue-600 flex-shrink-0 ml-2">
            <span className="text-ellipsis">{movie.price.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 min-w-0">
            <Link
              to={`/movies/${movie.id}`}
              className="btn-primary flex-1 text-center form-element"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-ellipsis">Chi tiết</span>
            </Link>
            {movie.status === 'NOW_SHOWING' && (
              <Link
                to={`/booking/${movie.id}`}
                className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium form-element"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-ellipsis">Đặt vé</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
