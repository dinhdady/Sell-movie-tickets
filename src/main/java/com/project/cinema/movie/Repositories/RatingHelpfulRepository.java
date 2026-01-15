package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.RatingHelpful;
import com.project.cinema.movie.Models.MovieRating;
import com.project.cinema.movie.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingHelpfulRepository extends JpaRepository<RatingHelpful, Long> {
    
    // Check if user has marked rating as helpful
    Optional<RatingHelpful> findByRatingAndUser(MovieRating rating, User user);
    
    // Count helpful votes for a rating
    Long countByRatingAndIsHelpfulTrue(MovieRating rating);
    
    // Count not helpful votes for a rating
    Long countByRatingAndIsHelpfulFalse(MovieRating rating);
    
    // Find all helpful votes for a rating
    List<RatingHelpful> findByRating(MovieRating rating);
    
    // Delete all helpful votes for a rating
    @Modifying
    @Query("DELETE FROM RatingHelpful rh WHERE rh.rating = :rating")
    void deleteByRating(@Param("rating") MovieRating rating);
}
