import React from 'react';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showNumber?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showNumber = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= rating;
      const StarIcon = isFilled ? StarSolidIcon : StarOutlineIcon;
      
      stars.push(
        <StarIcon
          key={i}
          className={`${sizeClasses[size]} ${
            interactive 
              ? 'cursor-pointer hover:text-yellow-400 transition-colors' 
              : ''
          } ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
          onClick={() => handleStarClick(i)}
        />
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {renderStars()}
      </div>
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}/{maxRating}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
