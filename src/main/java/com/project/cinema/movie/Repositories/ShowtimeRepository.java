package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(Long movieId);

    @Query("SELECT s FROM Showtime s JOIN FETCH s.room r JOIN FETCH r.cinema WHERE s.movie.id = :movieId")
    List<Showtime> findByMovieIdWithRoomAndCinema(@Param("movieId") Long movieId);
}