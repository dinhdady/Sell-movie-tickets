package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.ShowtimeDTO;
import com.project.cinema.movie.Models.Movie;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.Room;
import com.project.cinema.movie.Models.Showtime;
import com.project.cinema.movie.Repositories.ShowtimeRepository;
import com.project.cinema.movie.Services.MovieService;
import com.project.cinema.movie.Services.RoomService;
import com.project.cinema.movie.Services.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/showtime")
public class ShowtimeController {
    @Autowired
    private ShowtimeService showtimeService;
    @Autowired
    private MovieService movieSerive;
    @Autowired
    private RoomService roomService;
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping
    public ResponseEntity<ResponseObject> getAllShowtime(){
        List<Showtime> showtimes = showtimeService.getAllShowtime();
        return ResponseEntity.ok(new ResponseObject("SUCCESS", "Showtimes retrieved successfully!", showtimes));
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ResponseObject> getShowtimesByMovie(@PathVariable Long movieId){
        List<Showtime> showtimes = showtimeService.getShowtimesByMovieId(movieId);
        return ResponseEntity.ok(new ResponseObject("SUCCESS", "Showtimes for movie retrieved successfully!", showtimes));
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getShowtimeByMovie(@PathVariable Long id){
        Showtime found = showtimeService.getShowtimeById(id).orElse(null);
        return found != null ? ResponseEntity.ok(new ResponseObject("200","Found!",found))
        :ResponseEntity.status(404).body(new ResponseObject("404","Not found!",null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ResponseObject> addShowtime(@RequestBody ShowtimeDTO showtimeDTO){
        Movie movie = movieSerive.getMovieById(showtimeDTO.getMovieId());
        Room room = roomService.getRoomById(showtimeDTO.getRoomId());
        if (movie == null || room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseObject("404","Not found!",null));
        }
        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(showtimeDTO.getStartTime());
        showtime.setEndTime(showtimeDTO.getEndTime());
        Showtime saved = showtimeService.createShowtime(showtime);
        return saved != null ? ResponseEntity.ok(new ResponseObject("200","Inserting showtime successfully",saved))
                :ResponseEntity.status(HttpStatus.CONFLICT).body(new ResponseObject("409","Show time existed!",""));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseObject> deleteShowtimeById(@PathVariable Long id){
        showtimeService.deleteShowtimeById(id);
        return ResponseEntity.ok(new ResponseObject("200","Deleted successfully!",null));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateShowtimeById(@PathVariable Long id, @RequestBody Showtime showtime){
        Showtime updated = showtimeService.updateShowtimeById(id, showtime);
        return ResponseEntity.ok(new ResponseObject("200","Update successfully!",updated));
    }

}
