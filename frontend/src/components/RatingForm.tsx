import React, { useState } from 'react';
import { ratingAPI } from '../services/ratingApi';
import { getCurrentUser } from '../utils/auth';
import type { RatingRequest, MovieRating } from '../types/rating';
import RatingStars from './RatingStars';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

interface RatingFormProps {
  movieId: number;
  movieTitle: string;
  existingRating?: MovieRating;
  onRatingSubmitted: (rating: MovieRating) => void;
  onCancel: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({
  movieId,
  movieTitle,
  existingRating,
  onRatingSubmitted,
  onCancel
}) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [review, setReview] = useState(existingRating?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Debug logging
      console.log('=== RATING SUBMISSION DEBUG ===');
      console.log('Movie ID:', movieId);
      console.log('Rating:', rating);
      console.log('Review:', review);
      console.log('Existing Rating:', existingRating);
      
      // Check user authentication
      const user = getCurrentUser();
      console.log('User from cookie:', user);
      
      if (user) {
        console.log('User ID:', user.id);
      }

      const request: RatingRequest = {
        movieId,
        rating,
        review: review.trim() || undefined
      };

      console.log('Rating request:', request);
      let submittedRating: MovieRating;
      
      if (existingRating) {
        // Update existing rating
        console.log('Updating existing rating:', existingRating.id);
        submittedRating = await ratingAPI.updateRating(existingRating.id, request);
        console.log('Rating updated successfully:', submittedRating);
      } else {
        // Create new rating
        console.log('Creating new rating');
        submittedRating = await ratingAPI.submitRating(request);
        console.log('Rating submitted successfully:', submittedRating);
      }
      
      onRatingSubmitted(submittedRating);
    } catch (err: unknown) {
      console.error('Rating submission error:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {existingRating ? 'Update Your Rating' : 'Rate This Movie'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {movieTitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <RatingStars
            rating={rating}
            interactive={true}
            onRatingChange={setRating}
            showNumber={true}
            size="lg"
          />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your thoughts about this movie..."
            maxLength={1000}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {review.length}/1000 characters
          </div>
        </div>

        {/* Verified Purchase Badge */}
        <div className="flex items-center text-sm text-green-600">
          <CheckBadgeIcon className="h-4 w-4 mr-1" />
          <span>Verified Purchase</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : (existingRating ? 'Update Rating' : 'Submit Rating')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;
