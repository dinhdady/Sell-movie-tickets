import React, { useState } from 'react';
import { ratingAPI } from '../services/ratingApi';
import type { MovieRating } from '../types/rating';
import RatingStars from './RatingStars';
import { CheckBadgeIcon, HandThumbUpIcon, HandThumbDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as ThumbUpSolidIcon, HandThumbDownIcon as ThumbDownSolidIcon } from '@heroicons/react/24/solid';

interface RatingListProps {
  ratings: MovieRating[];
  currentUserId?: string;
  onRatingUpdate?: () => void;
  onEditRating?: (rating: MovieRating) => void;
}

const RatingList: React.FC<RatingListProps> = ({
  ratings,
  currentUserId,
  onRatingUpdate,
  onEditRating
}) => {
  const [helpfulVotes, setHelpfulVotes] = useState<Set<number>>(new Set());
  const [notHelpfulVotes, setNotHelpfulVotes] = useState<Set<number>>(new Set());
  const [deletingRating, setDeletingRating] = useState<number | null>(null);

  const handleHelpfulVote = async (ratingId: number, isHelpful: boolean) => {
    try {
      await ratingAPI.markRatingHelpful(ratingId, isHelpful);
      
      if (isHelpful) {
        setHelpfulVotes(prev => new Set([...prev, ratingId]));
        setNotHelpfulVotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(ratingId);
          return newSet;
        });
      } else {
        setNotHelpfulVotes(prev => new Set([...prev, ratingId]));
        setHelpfulVotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(ratingId);
          return newSet;
        });
      }
      
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (error) {
      console.error('Failed to vote on rating:', error);
    }
  };

  const handleEditRating = (rating: MovieRating) => {
    if (onEditRating) {
      onEditRating(rating);
    }
  };

  const handleDeleteRating = async (ratingId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      setDeletingRating(ratingId);
      await ratingAPI.deleteRating(ratingId);
      
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (error) {
      console.error('Failed to delete rating:', error);
      alert('Không thể xóa đánh giá. Vui lòng thử lại.');
    } finally {
      setDeletingRating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá phim này!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ratings && ratings.length > 0 ? ratings.map((rating) => (
        <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Rating Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {rating.userFullName || rating.username}
                  </span>
                  {rating.isVerified && (
                    <div className="flex items-center text-green-600">
                      <CheckBadgeIcon className="h-4 w-4" />
                      <span className="text-xs ml-1">Verified</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <RatingStars rating={rating.rating} size="sm" />
                  <span className="text-sm text-gray-500">
                    {formatDate(rating.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Content */}
          {rating.review && (
            <div className="mb-3">
              <p className="text-gray-700 leading-relaxed">{rating.review}</p>
            </div>
          )}

          {/* Helpful Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleHelpfulVote(rating.id, true)}
                className={`flex items-center space-x-1 text-sm ${
                  helpfulVotes.has(rating.id)
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                {helpfulVotes.has(rating.id) ? (
                  <ThumbUpSolidIcon className="h-4 w-4" />
                ) : (
                  <HandThumbUpIcon className="h-4 w-4" />
                )}
                <span>Helpful ({rating.isHelpful})</span>
              </button>
              
              <button
                onClick={() => handleHelpfulVote(rating.id, false)}
                className={`flex items-center space-x-1 text-sm ${
                  notHelpfulVotes.has(rating.id)
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                {notHelpfulVotes.has(rating.id) ? (
                  <ThumbDownSolidIcon className="h-4 w-4" />
                ) : (
                  <HandThumbDownIcon className="h-4 w-4" />
                )}
                <span>Not Helpful</span>
              </button>
            </div>

            {/* Edit/Delete for own ratings */}
            {currentUserId === rating.userId && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEditRating(rating)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDeleteRating(rating.id)}
                  disabled={deletingRating === rating.id}
                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>{deletingRating === rating.id ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có đánh giá nào để hiển thị.</p>
        </div>
      )}
    </div>
  );
};

export default RatingList;
