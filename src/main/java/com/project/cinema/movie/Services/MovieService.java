package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.MovieDTO;
import com.project.cinema.movie.Models.Movie;
import com.project.cinema.movie.Models.Showtime;
import com.project.cinema.movie.Repositories.MovieRepository;
import com.project.cinema.movie.Repositories.ShowtimeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovieService {
    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private ShowtimeRepository showtimeRepository;
     @Autowired
     private CloudinaryService cloudinaryService;
    private static final Logger log = LoggerFactory.getLogger(MovieService.class);
    public Movie getMovieById(Long id) {
        return movieRepository.findById(id).orElse(null);
    }

    public List<Showtime> getShowtimesByMovieId(Long movieId) {
        List<Showtime> showtimes = showtimeRepository.findByMovieIdWithRoomAndCinema(movieId);
        // Filter to show only active showtimes (endTime > now) for room display
        Date now = new Date();
        System.out.println("[MovieService] Filtering showtimes for movie " + movieId + " at: " + now);
        System.out.println("[MovieService] Total showtimes before filtering: " + showtimes.size());
        
        List<Showtime> filteredShowtimes = showtimes.stream()
            .filter(showtime -> {
                // Check if endTime is not null before calling after()
                if (showtime.getEndTime() == null) {
                    System.out.println("[MovieService] Showtime ID: " + showtime.getId() + 
                        " has null endTime, skipping");
                    return false;
                }
                boolean isActive = showtime.getEndTime().after(now);
                System.out.println("[MovieService] Showtime ID: " + showtime.getId() + 
                    ", StartTime: " + showtime.getStartTime() + 
                    ", EndTime: " + showtime.getEndTime() +
                    ", IsActive: " + isActive);
                return isActive;
            })
            .collect(Collectors.toList());
            
        System.out.println("[MovieService] Active showtimes after filtering: " + filteredShowtimes.size());
        return filteredShowtimes;
    }
    @Transactional
    public Movie createMovie(MovieDTO movieDto, MultipartFile posterImg) {
        log.info("[MovieService] Creating movie with DTO: " + movieDto);
        log.info("[MovieService] Cast value: '" + movieDto.getCast() + "'");
        log.info("[MovieService] FilmRating value: " + movieDto.getFilmRating());
        
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
        
        log.info("[MovieService] Movie object before save:");
        
        // Handle poster upload
        if (posterImg != null && !posterImg.isEmpty()) {
            movie.setPosterUrl(cloudinaryService.storedFile(posterImg));
        } else {
            movie.setPosterUrl("default-poster.jpg"); // Default poster
        }
        
        Movie savedMovie = movieRepository.save(movie);
        log.info("[MovieService] Movie saved with ID: " + savedMovie.getId());
        log.info("[MovieService] Saved movie cast: '" + savedMovie.getCast() + "'");
        log.info("[MovieService] Saved movie filmRating: " + savedMovie.getFilmRating());
        
        return savedMovie;
    }

    public Page<Movie> getAllMoviesWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return movieRepository.findAll(pageable);
    }
    public Movie updateMovie(Long id, MovieDTO movieDto, MultipartFile posterImg) {
        log.info("[MovieService] Updating movie with ID: " + id);
        log.info("[MovieService] MovieDTO received: " + movieDto);
        log.info("[MovieService] Cast value: '" + movieDto.getCast() + "'");
        log.info("[MovieService] FilmRating value: " + movieDto.getFilmRating());
        
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
            
            log.info("[MovieService] Updated movie object:");
            log.info("  - Cast: '" + movie.getCast() + "'");
            log.info("  - FilmRating: " + movie.getFilmRating());
            
            return movie;
        });
        
        Movie savedMovie = movieRepository.save(updated.get());
        log.info("[MovieService] Movie updated successfully with ID: " + savedMovie.getId());
        log.info("[MovieService] Updated movie cast: '" + savedMovie.getCast() + "'");
        log.info("[MovieService] Updated movie filmRating: " + savedMovie.getFilmRating());
        
        return savedMovie;
    }
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }
    public java.util.List<Movie> getMoviesReleasedAfterCurrentDate() {
        java.util.Date now = new java.util.Date();
        // Lấy phim có releaseDate > now (không cần kiểm tra status)
        return movieRepository.findByReleaseDateAfter(now);
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