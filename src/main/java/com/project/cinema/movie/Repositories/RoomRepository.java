package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("SELECT r FROM Room r WHERE r.cinema.id = :cinemaId")
    List<Room> findByCinemaId(@Param("cinemaId") Long cinemaId);
    
    Optional<Room> findByName(String name);
}
