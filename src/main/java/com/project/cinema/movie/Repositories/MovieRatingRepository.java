package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.MovieRating;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Models.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRatingRepository extends JpaRepository<MovieRating, Long> {
    
    // Find rating by user and movie
    Optional<MovieRating> findByUserAndMovie(User user, Movie movie);
    
    // Find all ratings for a movie
    List<MovieRating> findByMovieOrderByCreatedAtDesc(Movie movie);
    
    // Find all ratings by user
    List<MovieRating> findByUserOrderByCreatedAtDesc(User user);
    
    // Check if user has rated a movie
    boolean existsByUserAndMovie(User user, Movie movie);
    
    // Get average rating for a movie
    @Query("SELECT AVG(mr.rating) FROM MovieRating mr WHERE mr.movie = :movie")
    Double getAverageRatingByMovie(@Param("movie") Movie movie);
    
    // Get rating count for a movie
    @Query("SELECT COUNT(mr) FROM MovieRating mr WHERE mr.movie = :movie")
    Long getRatingCountByMovie(@Param("movie") Movie movie);
    
    // Get rating distribution for a movie
    @Query("SELECT mr.rating, COUNT(mr) FROM MovieRating mr WHERE mr.movie = :movie GROUP BY mr.rating ORDER BY mr.rating")
    List<Object[]> getRatingDistributionByMovie(@Param("movie") Movie movie);
    
    // Get verified ratings only
    List<MovieRating> findByMovieAndIsVerifiedTrueOrderByCreatedAtDesc(Movie movie);
    
    // Get top rated movies
    @Query("SELECT mr.movie, AVG(mr.rating) as avgRating, COUNT(mr) as ratingCount " +
           "FROM MovieRating mr " +
           "GROUP BY mr.movie " +
           "HAVING COUNT(mr) >= :minRatings " +
           "ORDER BY avgRating DESC, ratingCount DESC")
    List<Object[]> getTopRatedMovies(@Param("minRatings") Long minRatings);
}
