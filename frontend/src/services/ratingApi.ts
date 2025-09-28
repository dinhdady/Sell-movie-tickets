import api from './api';
import type { MovieRating, RatingRequest, RatingStats } from '../types/rating';
import { getCurrentUserId } from '../utils/auth';

export const ratingAPI = {
  // Submit or update rating
  submitRating: async (request: RatingRequest): Promise<MovieRating> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await api.post('/ratings', request, {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data.object;
  },

  // Update existing rating
  updateRating: async (ratingId: number, request: RatingRequest): Promise<MovieRating> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const response = await api.put(`/ratings/${ratingId}`, request, {
      headers: {
        'X-User-Id': userId
      }
    });
    return response.data.object;
  },

  // Get ratings for a movie
  getMovieRatings: async (movieId: number, verifiedOnly: boolean = false): Promise<MovieRating[]> => {
    const response = await api.get(`/ratings/movie/${movieId}?verifiedOnly=${verifiedOnly}`);
    return response.data.object || [];
  },

  // Get user's ratings
  getUserRatings: async (userId: string): Promise<MovieRating[]> => {
    const response = await api.get(`/ratings/user/${userId}`);
    return response.data.object || [];
  },

  // Get movie rating statistics
  getMovieRatingStats: async (movieId: number): Promise<RatingStats> => {
    const response = await api.get(`/ratings/movie/${movieId}/stats`);
    return response.data.object;
  },

  // Mark rating as helpful
  markRatingHelpful: async (ratingId: number, isHelpful: boolean): Promise<void> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await api.post(`/ratings/${ratingId}/helpful?isHelpful=${isHelpful}`, {}, {
      headers: {
        'X-User-Id': userId
      }
    });
  },

  // Delete rating
  deleteRating: async (ratingId: number): Promise<void> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await api.delete(`/ratings/${ratingId}`, {
      headers: {
        'X-User-Id': userId
      }
    });
  }
};
