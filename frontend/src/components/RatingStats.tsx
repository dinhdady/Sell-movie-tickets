import React from 'react';
import type { RatingStats as RatingStatsType } from '../types/rating';
import RatingStars from './RatingStars';

interface RatingStatsProps {
  stats: RatingStatsType;
}

const RatingStats: React.FC<RatingStatsProps> = ({ stats }) => {
  const { averageRating, ratingCount, distribution } = stats;

  const getRatingPercentage = (rating: number) => {
    const ratingData = distribution.find(([r]) => r === rating);
    const count = ratingData ? ratingData[1] : 0;
    return ratingCount > 0 ? (count / ratingCount) * 100 : 0;
  };

  const getRatingCount = (rating: number) => {
    const ratingData = distribution.find(([r]) => r === rating);
    return ratingData ? ratingData[1] : 0;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="mb-2">
            <RatingStars rating={Math.round(averageRating)} size="lg" showNumber={false} />
          </div>
          <div className="text-sm text-gray-600">
            Based on {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
          {[5, 4, 3, 2, 1].map((rating) => {
            const percentage = getRatingPercentage(rating);
            const count = getRatingCount(rating);
            
            return (
              <div key={rating} className="flex items-center space-x-2">
                <div className="w-8 text-sm text-gray-600">
                  {rating}★
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {count}
                </div>
                <div className="w-12 text-sm text-gray-500 text-right">
                  ({percentage.toFixed(0)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingStats;
