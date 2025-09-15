package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.Movie;
import com.project.cinema.movie.Models.Showtime;
import com.project.cinema.movie.Repositories.MovieRepository;
import com.project.cinema.movie.Repositories.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.project.cinema.movie.DTO.MovieDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.swing.text.html.Option;

@Service
public class MovieService {
    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private ShowtimeRepository showtimeRepository;
    // @Autowired
    // private CloudinaryService cloudinaryService;

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id).orElse(null);
    }

    public List<Showtime> getShowtimesByMovieId(Long movieId) {
        return showtimeRepository.findByMovieIdWithRoomAndCinema(movieId);
    }
    @Transactional
    public Movie createMovie(MovieDTO movieDto, MultipartFile posterImg) {
        if (movieRepository.existsByTitle(movieDto.getTitle())) {
            throw new IllegalArgumentException("the movie already exists");
        }
        Movie movie = new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setCast(movieDto.getCast());
        movie.setLanguage(movieDto.getLanguage());
        movie.setGenre(movieDto.getGenre());
        movie.setDuration(movieDto.getDuration());
        movie.setReleaseDate(movieDto.getReleaseDate());
        movie.setRating(movieDto.getRating());
        movie.setStatus(movieDto.getStatus());
        movie.setPrice(movieDto.getPrice());
        // movie.setPosterUrl(cloudinaryService.storedFile(posterImg));
        movie.setPosterUrl("default-poster.jpg"); // Temporary default poster
        return movieRepository.save(movie);
    }

    public Page<Movie> getAllMoviesWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return movieRepository.findAll(pageable);
    }
    public Movie updateMovie(Long id, MovieDTO movieDto, MultipartFile posterImg) {
        Optional<Movie> updated = movieRepository.findById(id).map(movie -> {
            movie.setTitle(movieDto.getTitle());
            movie.setLanguage(movieDto.getLanguage());
            movie.setGenre(movieDto.getGenre());
            movie.setPrice(movieDto.getPrice());
            movie.setStatus(movieDto.getStatus());
            movie.setCast(movieDto.getCast());
            if (posterImg!=null) {
                // movie.setPosterUrl(cloudinaryService.storedFile(posterImg));
        movie.setPosterUrl("default-poster.jpg"); // Temporary default poster
            }
            else{
                movie.setPosterUrl(movie.getPosterUrl());
            }
            movie.setDuration(movieDto.getDuration());
            movie.setDescription(movieDto.getDescription());
            movie.setDirector(movieDto.getDirector());
            movie.setTrailerUrl(movieDto.getTrailerUrl());
            return movie;
        });
        return movieRepository.save(updated.get());
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