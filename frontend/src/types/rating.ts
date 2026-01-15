export interface MovieRating {
  id: number;
  userId: string;
  username: string;
  userFullName: string;
  movieId: number;
  movieTitle: string;
  rating: number;
  review?: string;
  isVerified: boolean;
  isHelpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingRequest {
  movieId: number;
  rating: number;
  review?: string;
}

export interface RatingStats {
  movieId: number;
  averageRating: number;
  ratingCount: number;
  distribution: Array<[number, number]>; // [rating, count]
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}
