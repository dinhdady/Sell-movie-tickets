export interface Movie {
  id?: number;
  title: string;
  originalTitle?: string; // English title
  description: string;
  duration: number;
  releaseDate: Date;
  genre: string;
  director: string;
  cast: string;
  posterUrl?: string;
  trailerUrl?: string;
  rating: number;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
  filmRating?: string;
  price: number;
  episodes?: number; // Number of episodes for series
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MovieDTO {
  title: string;
  originalTitle?: string; // English title
  description: string;
  duration: number;
  releaseDate: Date;
  genre: string;
  director: string;
  cast: string;
  rating: number;
  status: string;
  filmRating?: string;
  price: number;
  episodes?: number; // Number of episodes for series
  posterFile?: File;
  bannerFile?: File;
  [key: string]: any; // Allow dynamic property access
}
