// Movie types
export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  genre: string;
  director: string;
  cast: string;
  rating: number;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
  filmRating: 'G' | 'PG' | 'PG13' | 'R' | 'NC17';
  price: number;
  posterUrl?: string;
  trailerUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
// Showtime types
export interface Showtime {
  id: number;
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  movie?: Movie;
  room?: Room;
}
// Room types
export interface Room {
  id: number;
  name: string;
  capacity: number;
  cinemaId: number;
  cinema?: Cinema;
}
// Cinema types
export interface Cinema {
  id: number;
  name: string;
  address: string;
  phone: string;
  cinemaType: 'STANDARD' | 'PREMIUM' | 'IMAX' | '4DX';
}
