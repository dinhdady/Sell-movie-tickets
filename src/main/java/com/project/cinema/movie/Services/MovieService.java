package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.MovieDTO;
import com.project.cinema.movie.Models.Movie;
import com.project.cinema.movie.Models.Showtime;
import com.project.cinema.movie.Repositories.MovieRepository;
import com.project.cinema.movie.Repositories.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {
    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private ShowtimeRepository showtimeRepository;
     @Autowired
     private CloudinaryService cloudinaryService;

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id).orElse(null);
    }

    public List<Showtime> getShowtimesByMovieId(Long movieId) {
        return showtimeRepository.findByMovieIdWithRoomAndCinema(movieId);
    }
    @Transactional
    public Movie createMovie(MovieDTO movieDto, MultipartFile posterImg) {
        System.out.println("[MovieService] Creating movie with DTO: " + movieDto);
        System.out.println("[MovieService] Cast value: '" + movieDto.getCast() + "'");
        System.out.println("[MovieService] FilmRating value: " + movieDto.getFilmRating());
        
        // Check for duplicate title (case-insensitive and trimmed)
        String trimmedTitle = movieDto.getTitle().trim();
        if (movieRepository.existsByTitleIgnoreCase(trimmedTitle)) {
            throw new IllegalArgumentException("Phim với tên '" + trimmedTitle + "' đã tồn tại");
        }
        Movie movie = new Movie();
        movie.setTitle(trimmedTitle);
        movie.setDescription(movieDto.getDescription());
        movie.setCast(movieDto.getCast());
        movie.setLanguage(movieDto.getLanguage());
        movie.setGenre(movieDto.getGenre());
        movie.setDuration(movieDto.getDuration());
        movie.setReleaseDate(movieDto.getReleaseDate());
        movie.setRating(movieDto.getRating());
        movie.setStatus(movieDto.getStatus());
        movie.setPrice(movieDto.getPrice());
        movie.setDirector(movieDto.getDirector());
        movie.setTrailerUrl(movieDto.getTrailerUrl());
        movie.setFilmRating(movieDto.getFilmRating());
        
        System.out.println("[MovieService] Movie object before save:");
        System.out.println("  - Cast: '" + movie.getCast() + "'");
        System.out.println("  - FilmRating: " + movie.getFilmRating());
        
        // Handle poster upload
        if (posterImg != null && !posterImg.isEmpty()) {
            movie.setPosterUrl(cloudinaryService.storedFile(posterImg));
        } else {
            movie.setPosterUrl("default-poster.jpg"); // Default poster
        }
        
        Movie savedMovie = movieRepository.save(movie);
        System.out.println("[MovieService] Movie saved with ID: " + savedMovie.getId());
        System.out.println("[MovieService] Saved movie cast: '" + savedMovie.getCast() + "'");
        System.out.println("[MovieService] Saved movie filmRating: " + savedMovie.getFilmRating());
        
        return savedMovie;
    }

    public Page<Movie> getAllMoviesWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return movieRepository.findAll(pageable);
    }
    public Movie updateMovie(Long id, MovieDTO movieDto, MultipartFile posterImg) {
        System.out.println("[MovieService] Updating movie with ID: " + id);
        System.out.println("[MovieService] MovieDTO received: " + movieDto);
        System.out.println("[MovieService] Cast value: '" + movieDto.getCast() + "'");
        System.out.println("[MovieService] FilmRating value: " + movieDto.getFilmRating());
        
        // Check for duplicate title (case-insensitive and trimmed) - exclude current movie
        String trimmedTitle = movieDto.getTitle().trim();
        Optional<Movie> existingMovie = movieRepository.findByTitleIgnoreCase(trimmedTitle);
        if (existingMovie.isPresent() && !existingMovie.get().getId().equals(id)) {
            throw new IllegalArgumentException("Phim với tên '" + trimmedTitle + "' đã tồn tại");
        }
        
        Optional<Movie> updated = movieRepository.findById(id).map(movie -> {
            movie.setTitle(trimmedTitle);
            movie.setDescription(movieDto.getDescription());
            movie.setCast(movieDto.getCast());
            movie.setLanguage(movieDto.getLanguage());
            movie.setGenre(movieDto.getGenre());
            movie.setDuration(movieDto.getDuration());
            movie.setReleaseDate(movieDto.getReleaseDate());
            movie.setRating(movieDto.getRating());
            movie.setStatus(movieDto.getStatus());
            movie.setPrice(movieDto.getPrice());
            movie.setDirector(movieDto.getDirector());
            movie.setTrailerUrl(movieDto.getTrailerUrl());
            movie.setFilmRating(movieDto.getFilmRating());
            
            // Handle poster upload
            if (posterImg != null && !posterImg.isEmpty()) {
                movie.setPosterUrl(cloudinaryService.storedFile(posterImg));
            }
            // If no new poster, keep existing one
            
            System.out.println("[MovieService] Updated movie object:");
            System.out.println("  - Cast: '" + movie.getCast() + "'");
            System.out.println("  - FilmRating: " + movie.getFilmRating());
            
            return movie;
        });
        
        Movie savedMovie = movieRepository.save(updated.get());
        System.out.println("[MovieService] Movie updated successfully with ID: " + savedMovie.getId());
        System.out.println("[MovieService] Updated movie cast: '" + savedMovie.getCast() + "'");
        System.out.println("[MovieService] Updated movie filmRating: " + savedMovie.getFilmRating());
        
        return savedMovie;
    }
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }
    public java.util.List<Movie> getMoviesReleasedAfterCurrentDate() {
        java.util.Date now = new java.util.Date();
        return movieRepository.findByReleaseDateAfterAndStatus(now, "COMING_SOON");
    }
    public java.util.List<Movie> getMoviesReleasedBeforeCurrentDate() {
        java.util.Date now = new java.util.Date();
        // Phim đang chiếu: ngày phát hành <= ngày hiện tại VÀ status = NOW_SHOWING
        return movieRepository.findByReleaseDateBeforeOrEqualAndStatus(now, "NOW_SHOWING");
    }
    public java.util.Map<String, Object> getTotalRevenueStats() { return new java.util.HashMap<>(); }
    public java.util.Map<String, Object> getMovieRevenueStats(Long movieId) { return new java.util.HashMap<>(); }
    public java.util.List<Movie> searchMovies(String query) { 
        return movieRepository.searchMovies(query);
    }
    public java.util.List<Movie> advancedSearch(String title, String genre, String status, Double minRating, Double maxRating, Double minPrice, Double maxPrice) { 
        return movieRepository.advancedSearch(title, genre, status, minRating, maxRating, minPrice, maxPrice);
    }
    public java.util.List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreContainingIgnoreCase(genre);
    }
    public java.util.List<String> getAllGenres() {
        return movieRepository.findAllGenres();
    }
    public java.util.Map<String, java.util.List<Movie>> getMoviesByCategory() { return new java.util.HashMap<>(); }
} 