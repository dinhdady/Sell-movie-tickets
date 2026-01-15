package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.MovieRatingDTO;
import com.project.cinema.movie.DTO.RatingRequest;
import com.project.cinema.movie.Models.MovieRating;
import com.project.cinema.movie.Models.RatingHelpful;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Models.Movie;
import com.project.cinema.movie.Models.Booking;
import com.project.cinema.movie.Models.BookingStatus;
import com.project.cinema.movie.Repositories.MovieRatingRepository;
import com.project.cinema.movie.Repositories.RatingHelpfulRepository;
import com.project.cinema.movie.Repositories.UserRepository;
import com.project.cinema.movie.Repositories.MovieRepository;
import com.project.cinema.movie.Repositories.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovieRatingService {
    
    private static final Logger logger = LoggerFactory.getLogger(MovieRatingService.class);
    
    @Autowired
    private MovieRatingRepository movieRatingRepository;
    
    @Autowired
    private RatingHelpfulRepository ratingHelpfulRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    // Submit or update rating
    @Transactional
    public MovieRatingDTO submitRating(String userId, RatingRequest request) {
        logger.info("[MovieRatingService] Submitting rating for user: {}, movie: {}", userId, request.getMovieId());
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Movie movie = movieRepository.findById(request.getMovieId())
            .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        // Check if user has already rated this movie
        Optional<MovieRating> existingRating = movieRatingRepository.findByUserAndMovie(user, movie);
        
        MovieRating rating;
        if (existingRating.isPresent()) {
            // Update existing rating
            rating = existingRating.get();
            rating.setRating(request.getRating());
            rating.setReview(request.getReview());
            rating.setUpdatedAt(LocalDateTime.now());
            logger.info("[MovieRatingService] Updating existing rating ID: {}", rating.getId());
        } else {
            // Create new rating
            rating = new MovieRating(user, movie, request.getRating(), request.getReview());
            logger.info("[MovieRatingService] Creating new rating");
        }
        
        // Check if user has verified purchase (has booking for this movie)
        boolean hasVerifiedPurchase = checkUserHasBookingForMovie(user, request.getMovieId());
        rating.setIsVerified(hasVerifiedPurchase);
        
        MovieRating savedRating = movieRatingRepository.save(rating);
        logger.info("[MovieRatingService] Rating saved successfully with ID: {}", savedRating.getId());
        
        return convertToDTO(savedRating);
    }

    // Update existing rating
    @Transactional
    public MovieRatingDTO updateRating(String userId, Long ratingId, RatingRequest request) {
        logger.info("[MovieRatingService] Updating rating {} for user: {}, movie: {}", ratingId, userId, request.getMovieId());
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        MovieRating rating = movieRatingRepository.findById(ratingId)
            .orElseThrow(() -> new RuntimeException("Rating not found"));
        
        // Check if user owns the rating
        if (!rating.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own ratings");
        }
        
        // Update rating fields
        rating.setRating(request.getRating());
        rating.setReview(request.getReview());
        rating.setUpdatedAt(LocalDateTime.now());
        
        // Check if user has verified purchase (has booking for this movie)
        boolean hasVerifiedPurchase = checkUserHasBookingForMovie(user, request.getMovieId());
        rating.setIsVerified(hasVerifiedPurchase);
        
        MovieRating savedRating = movieRatingRepository.save(rating);
        logger.info("[MovieRatingService] Rating updated successfully with ID: {}", savedRating.getId());
        
        return convertToDTO(savedRating);
    }
    
    // Get ratings for a movie
    public List<MovieRatingDTO> getMovieRatings(Long movieId, boolean verifiedOnly) {
        logger.info("[MovieRatingService] Getting ratings for movie: {}, verifiedOnly: {}", movieId, verifiedOnly);
        
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        List<MovieRating> ratings;
        if (verifiedOnly) {
            ratings = movieRatingRepository.findByMovieAndIsVerifiedTrueOrderByCreatedAtDesc(movie);
        } else {
            ratings = movieRatingRepository.findByMovieOrderByCreatedAtDesc(movie);
        }
        
        return ratings.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Get user's ratings
    public List<MovieRatingDTO> getUserRatings(String userId) {
        logger.info("[MovieRatingService] Getting ratings for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<MovieRating> ratings = movieRatingRepository.findByUserOrderByCreatedAtDesc(user);
        
        return ratings.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Get movie rating statistics
    public MovieRatingStats getMovieRatingStats(Long movieId) {
        logger.info("[MovieRatingService] Getting rating stats for movie: {}", movieId);
        
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        Double averageRating = movieRatingRepository.getAverageRatingByMovie(movie);
        Long ratingCount = movieRatingRepository.getRatingCountByMovie(movie);
        List<Object[]> distribution = movieRatingRepository.getRatingDistributionByMovie(movie);
        
        MovieRatingStats stats = new MovieRatingStats();
        stats.setMovieId(movieId);
        stats.setAverageRating(averageRating != null ? averageRating : 0.0);
        stats.setRatingCount(ratingCount != null ? ratingCount : 0L);
        stats.setDistribution(distribution);
        
        return stats;
    }
    
    // Mark rating as helpful
    @Transactional
    public void markRatingHelpful(String userId, Long ratingId, boolean isHelpful) {
        logger.info("[MovieRatingService] Marking rating {} as helpful: {} by user: {}", ratingId, isHelpful, userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        MovieRating rating = movieRatingRepository.findById(ratingId)
            .orElseThrow(() -> new RuntimeException("Rating not found"));
        
        // Check if user has already voted
        Optional<RatingHelpful> existingVote = ratingHelpfulRepository.findByRatingAndUser(rating, user);
        
        if (existingVote.isPresent()) {
            // Update existing vote
            RatingHelpful vote = existingVote.get();
            vote.setIsHelpful(isHelpful);
            ratingHelpfulRepository.save(vote);
        } else {
            // Create new vote
            RatingHelpful vote = new RatingHelpful(rating, user, isHelpful);
            ratingHelpfulRepository.save(vote);
        }
        
        // Update helpful count
        Long helpfulCount = ratingHelpfulRepository.countByRatingAndIsHelpfulTrue(rating);
        rating.setIsHelpful(helpfulCount.intValue());
        movieRatingRepository.save(rating);
        
        logger.info("[MovieRatingService] Rating helpful status updated successfully");
    }
    
    // Delete rating
    @Transactional
    public void deleteRating(String userId, Long ratingId) {
        logger.info("[MovieRatingService] Deleting rating: {} by user: {}", ratingId, userId);
        
        MovieRating rating = movieRatingRepository.findById(ratingId)
            .orElseThrow(() -> new RuntimeException("Rating not found"));
        
        // Check if user owns the rating
        if (!rating.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own ratings");
        }
        
        // Delete helpful votes first
        ratingHelpfulRepository.deleteByRating(rating);
        
        // Delete rating
        movieRatingRepository.delete(rating);
        
        logger.info("[MovieRatingService] Rating deleted successfully");
    }
    
    // Check if user has booking for specific movie
    private boolean checkUserHasBookingForMovie(User user, Long movieId) {
        try {
            // Query to check if user has any confirmed booking for this movie
            List<Booking> bookings = bookingRepository.findByUserId(user.getId());
            return bookings.stream()
                .anyMatch(booking -> 
                    booking.getShowtime() != null && 
                    booking.getShowtime().getMovie() != null && 
                    booking.getShowtime().getMovie().getId().equals(movieId) &&
                    booking.getStatus() == BookingStatus.CONFIRMED
                );
        } catch (Exception e) {
            logger.error("[MovieRatingService] Error checking user booking for movie: {}", e.getMessage());
            return false;
        }
    }

    // Convert entity to DTO
    private MovieRatingDTO convertToDTO(MovieRating rating) {
        MovieRatingDTO dto = new MovieRatingDTO();
        dto.setId(rating.getId());
        dto.setUserId(rating.getUser().getId());
        dto.setUsername(rating.getUser().getUsername());
        dto.setUserFullName(rating.getUser().getFullName());
        dto.setMovieId(rating.getMovie().getId());
        dto.setMovieTitle(rating.getMovie().getTitle());
        dto.setRating(rating.getRating());
        dto.setReview(rating.getReview());
        dto.setIsVerified(rating.getIsVerified());
        dto.setIsHelpful(rating.getIsHelpful());
        dto.setCreatedAt(rating.getCreatedAt());
        dto.setUpdatedAt(rating.getUpdatedAt());
        return dto;
    }
    
    // Inner class for rating statistics
    public static class MovieRatingStats {
        private Long movieId;
        private Double averageRating;
        private Long ratingCount;
        private List<Object[]> distribution;
        
        // Getters and setters
        public Long getMovieId() { return movieId; }
        public void setMovieId(Long movieId) { this.movieId = movieId; }
        
        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
        
        public Long getRatingCount() { return ratingCount; }
        public void setRatingCount(Long ratingCount) { this.ratingCount = ratingCount; }
        
        public List<Object[]> getDistribution() { return distribution; }
        public void setDistribution(List<Object[]> distribution) { this.distribution = distribution; }
    }
}
