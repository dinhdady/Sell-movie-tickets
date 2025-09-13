package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.Showtime;
import com.project.cinema.movie.Repositories.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ShowtimeService {
    @Autowired
    private ShowtimeRepository showtimeRepository;

    public List<Showtime> getShowtimeByMovieId(Long movieId) {
        return showtimeRepository.findByMovieIdWithRoomAndCinema(movieId);
    }

    public Showtime createShowtime(Showtime showtime) {
        return showtimeRepository.save(showtime);
    }
    public List<Showtime> getAllShowtime(){return showtimeRepository.findAll();}
    public Optional<Showtime> getShowtimeById(Long id){return showtimeRepository.findById(id);}
    public void deleteShowtimeById(Long id){showtimeRepository.deleteById(id);}

    public Showtime updateShowtimeById(Long id, Showtime updatedShowtime) {
        return showtimeRepository.findById(id).map(showtime -> {
            showtime.setMovie(updatedShowtime.getMovie());
            showtime.setRoom(updatedShowtime.getRoom());
            showtime.setStartTime(updatedShowtime.getStartTime());
            showtime.setEndTime(updatedShowtime.getEndTime());
            showtime.setUpdatedAt(new java.util.Date());
            return showtimeRepository.save(showtime);
        }).orElseThrow(() -> new RuntimeException("Showtime not found with id " + id));
    }
} 