package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Cinema;
import com.project.cinema.movie.Models.CinemaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {
}
