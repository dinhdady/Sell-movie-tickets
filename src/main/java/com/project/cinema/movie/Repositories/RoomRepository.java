package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByCinemaId(Long cinemaId);
    Optional<Room> findByName(String name);
}
