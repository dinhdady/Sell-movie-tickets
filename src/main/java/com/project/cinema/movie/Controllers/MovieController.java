package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.MovieDTO;
import com.project.cinema.movie.Models.Movie;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.CloudinaryService;
import com.project.cinema.movie.Services.MovieService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("api/movie")
//@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"}, allowCredentials = "true")
public class MovieController {
    // @Autowired
    // private CloudinaryService cloudinaryService;
    @Autowired
    private MovieService movieService;
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<ResponseObject> addNewMovie(@Valid @ModelAttribute MovieDTO movieDto, @RequestPart(name = "posterImg", required = false) MultipartFile posterImg){
        try {
            Movie movie = movieService.createMovie(movieDto, posterImg);

            return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseObject("201","Adding new movies successfully!",movie));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ResponseObject("409","Không thể thêm phim mới: " + e.getMessage(),""));
        }
    }
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<Movie> moviePage = movieService.getAllMoviesWithPagination(page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("movies", moviePage.getContent());
        response.put("currentPage", moviePage.getNumber());
        response.put("totalItems", moviePage.getTotalElements());
        response.put("totalPages", moviePage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{movieId}")
    public ResponseEntity<ResponseObject> getMovieById(@PathVariable Long movieId){
        try {
            Movie movie = movieService.getMovieById(movieId);
            if (movie != null) {
                return ResponseEntity.ok(new ResponseObject("200", "Movie retrieved successfully!", movie));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("404", "Movie not found", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving movie: " + e.getMessage(), null));
        }
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateMovie(@PathVariable Long id, @Valid @ModelAttribute MovieDTO movieDto, @RequestPart(name = "posterImg", required = false) MultipartFile posterImg) {
        try {
            System.out.println("[MovieController] Updating movie with ID: " + id);
            System.out.println("[MovieController] MovieDTO received: " + movieDto);
            System.out.println("[MovieController] FilmRating value: '" + movieDto.getFilmRating() + "'");
            System.out.println("[MovieController] FilmRating type: " + (movieDto.getFilmRating() != null ? movieDto.getFilmRating().getClass().getSimpleName() : "null"));
            System.out.println("[MovieController] FilmRating length: " + (movieDto.getFilmRating() != null ? movieDto.getFilmRating().toString().length() : "null"));
            
            // Print all form data for debugging
            System.out.println("[MovieController] All form data:");
            System.out.println("  - title: '" + movieDto.getTitle() + "'");
            System.out.println("  - description: '" + movieDto.getDescription() + "'");
            System.out.println("  - duration: " + movieDto.getDuration());
            System.out.println("  - releaseDate: '" + movieDto.getReleaseDate() + "'");
            System.out.println("  - genre: '" + movieDto.getGenre() + "'");
            System.out.println("  - director: '" + movieDto.getDirector() + "'");
            System.out.println("  - cast: '" + movieDto.getCast() + "'");
            System.out.println("  - rating: " + movieDto.getRating());
            System.out.println("  - status: '" + movieDto.getStatus() + "'");
            System.out.println("  - filmRating: '" + movieDto.getFilmRating() + "'");
            System.out.println("  - price: " + movieDto.getPrice());
            
            Movie updatedMovie = movieService.updateMovie(id, movieDto, posterImg);
            return ResponseEntity.status(HttpStatus.OK).body(new ResponseObject("200", "Movie updated successfully!", updatedMovie));
        } catch (Exception e) {
            System.err.println("[MovieController] Error updating movie: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseObject("400", "Error updating movie: " + e.getMessage(), null));
        }
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseObject> deleteMovie(@PathVariable Long id){
        movieService.deleteMovie(id);
        return ResponseEntity.status(HttpStatus.OK).body(new ResponseObject("200","Deleted movie successfully!",null));
    }
    @GetMapping("/coming-soon")
    public ResponseEntity<ResponseObject> getMoviesReleasedAfterCurrentDate() {
        try {
            List<Movie> movies = movieService.getMoviesReleasedAfterCurrentDate();
            return ResponseEntity.ok(new ResponseObject("200", "Coming soon movies retrieved successfully!", movies));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving coming soon movies: " + e.getMessage(), null));
        }
    }

    @GetMapping("/now-showing")
    public ResponseEntity<ResponseObject> getMoviesReleasedBeforeCurrentDate() {
        try {
            List<Movie> movies = movieService.getMoviesReleasedBeforeCurrentDate();
            return ResponseEntity.ok(new ResponseObject("200", "Now showing movies retrieved successfully!", movies));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving now showing movies: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/revenue/total")
    public ResponseEntity<Map<String, Object>> getTotalRevenue() {
        Map<String, Object> revenueStats = movieService.getTotalRevenueStats();
        return ResponseEntity.ok(revenueStats);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{movieId}/revenue")
    public ResponseEntity<Map<String, Object>> getMovieRevenue(@PathVariable Long movieId) {
        Map<String, Object> movieRevenue = movieService.getMovieRevenueStats(movieId);
        return ResponseEntity.ok(movieRevenue);
    }
    @GetMapping("/search")
    public ResponseEntity<ResponseObject> searchMovies(@RequestParam String query) {
        try {
            List<Movie> movies = movieService.searchMovies(query);
            return ResponseEntity.ok(new ResponseObject("200", "Movies search completed successfully!", movies));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error searching movies: " + e.getMessage(), null));
        }
    }
    @GetMapping("/advanced-search")
    public ResponseEntity<ResponseObject> advancedSearch(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double maxRating,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        try {
            List<Movie> movies = movieService.advancedSearch(title, genre, status, minRating, maxRating, minPrice, maxPrice);
            return ResponseEntity.ok(new ResponseObject("200", "Advanced search completed successfully!", movies));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error in advanced search: " + e.getMessage(), null));
        }
    }
    @GetMapping("/by-genre/{genre}")
    public ResponseEntity<ResponseObject> getMoviesByGenre(@PathVariable String genre) {
        try {
            List<Movie> movies = movieService.getMoviesByGenre(genre);
            return ResponseEntity.ok(new ResponseObject("200", "Movies by genre retrieved successfully!", movies));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("500", "Error retrieving movies by genre: " + e.getMessage(), null));
        }
    }
    @GetMapping("/genres")
    public ResponseEntity<ResponseObject> getAllGenres() {
        try {
            List<String> genres = movieService.getAllGenres();
            return ResponseEntity.ok(new ResponseObject("200", "Genres retrieved successfully!", genres));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving genres: " + e.getMessage(), null));
        }
    }

    @GetMapping("/by-category")
    public ResponseEntity<ResponseObject> getMoviesByCategory() {
        try {
            Map<String, List<Movie>> moviesByCategory = movieService.getMoviesByCategory();
            return ResponseEntity.ok(new ResponseObject("200", "Movies by category retrieved successfully!", moviesByCategory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving movies by category: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{movieId}/showtimes")
    @ResponseBody
    public ResponseEntity<ResponseObject> getShowtimesByMovie(@PathVariable Long movieId) {
        try {
            List<?> showtimes = movieService.getShowtimesByMovieId(movieId);
            return ResponseEntity.ok(new ResponseObject("200", "Showtimes retrieved successfully!", showtimes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving showtimes: " + e.getMessage(), null));
        }
    }
}
