package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.MovieRatingDTO;
import com.project.cinema.movie.DTO.RatingRequest;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.MovieRatingService;
import com.project.cinema.movie.Services.MovieRatingService.MovieRatingStats;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class MovieRatingController {
    
    private static final Logger logger = LoggerFactory.getLogger(MovieRatingController.class);
    
    @Autowired
    private MovieRatingService movieRatingService;
    
    // Submit new rating
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> submitRating(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody RatingRequest request) {
        try {
            logger.info("[MovieRatingController] Submitting rating for user: {}", userId);
            MovieRatingDTO rating = movieRatingService.submitRating(userId, request);
            return ResponseEntity.ok(new ResponseObject("200", "Rating submitted successfully!", rating));
        } catch (Exception e) {
            logger.error("[MovieRatingController] Error submitting rating: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error submitting rating: " + e.getMessage(), null));
        }
    }

    // Update existing rating
    @PutMapping("/{ratingId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> updateRating(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long ratingId,
            @Valid @RequestBody RatingRequest request) {
        try {
            logger.info("[MovieRatingController] Updating rating {} for user: {}", ratingId, userId);
            MovieRatingDTO rating = movieRatingService.updateRating(userId, ratingId, request);
            return ResponseEntity.ok(new ResponseObject("200", "Rating updated successfully!", rating));
        } catch (Exception e) {
            logger.error("[MovieRatingController] Error updating rating: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating rating: " + e.getMessage(), null));
        }
    }
    
    // Get ratings for a movie
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ResponseObject> getMovieRatings(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "false") boolean verifiedOnly) {
        try {
            logger.info("[MovieRatingController] Getting ratings for movie: {}", movieId);
            List<MovieRatingDTO> ratings = movieRatingService.getMovieRatings(movieId, verifiedOnly);
            return ResponseEntity.ok(new ResponseObject("200", "Ratings retrieved successfully!", ratings));
        } catch (Exception e) {
            logger.error("[MovieRatingController] Error getting movie ratings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error getting ratings: " + e.getMessage(), null));
        }
    }
    
    // Get user's ratings
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> getUserRatings(@PathVariable String userId) {
        try {
            logger.info("[MovieRatingController] Getting ratings for user: {}", userId);
            List<MovieRatingDTO> ratings = movieRatingService.getUserRatings(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User ratings retrieved successfully!", ratings));
        } catch (Exception e) {
            logger.error("[MovieRatingController] Error getting user ratings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error getting user ratings: " + e.getMessage(), null));
        }
    }
    
    // Get movie rating statistics
    @GetMapping("/movie/{movieId}/stats")
    public ResponseEntity<ResponseObject> getMovieRatingStats(@PathVariable Long movieId) {
        try {
            logger.info("[MovieRatingController] Getting rating stats for movie: {}", movieId);
            MovieRatingStats stats = movieRatingService.getMovieRatingStats(movieId);
            return ResponseEntity.ok(new ResponseObject("200", "Rating stats retrieved successfully!", stats));
        } catch (Exception e) {
            logger.error("[MovieRatingController] Error getting rating stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error getting rating stats: " + e.getMessage(), null));
        }
    }
    
    // Mark rating as helpful
    @PostMapping("/{ratingId}/helpful")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> markRatingHelpful(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long ratingId,
            @RequestParam boolean isHelpful) {
        try {
            logger.info("[MovieRatingController] Marking rating {} as helpful: {} by user: {}", ratingId, isHelpful, userId);
            movieRatingService.markRatingHelpful(userId, ratingId, isHelpful);
            return ResponseEntity.ok(new ResponseObject("200", "Rating helpful status updated successfully!", null));
        } catch (Exception e) {
            logger.error("[MovieRatingController] Error marking rating helpful: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating helpful status: " + e.getMessage(), null));
        }
    }
    
    // Delete rating
    @DeleteMapping("/{ratingId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> deleteRating(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long ratingId) {
        try {
            logger.info("[MovieRatingController] Deleting rating: {} by user: {}", ratingId, userId);
            movieRatingService.deleteRating(userId, ratingId);
            return ResponseEntity.ok(new ResponseObject("200", "Rating deleted successfully!", null));
        } catch (Exception e) {
            logger.error("[MovieRatingController] Error deleting rating: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error deleting rating: " + e.getMessage(), null));
        }
    }
}
