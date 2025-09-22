package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/showtime")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5177", "http://127.0.0.1:5177"}, allowCredentials = "true")
public class ShowtimeController {
    
    @Autowired
    private ShowtimeService showtimeService;

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ResponseObject> getShowtimesByMovie(@PathVariable Long movieId) {
        try {
            List<?> showtimes = showtimeService.getShowtimesByMovieId(movieId);
            return ResponseEntity.ok(new ResponseObject("200", "Showtimes retrieved successfully!", showtimes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving showtimes: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ResponseObject> createShowtime(@RequestBody Map<String, Object> showtimeData) {
        try {
            Object result = showtimeService.createShowtime(showtimeData);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject("201", "Showtime created successfully!", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error creating showtime: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateShowtime(@PathVariable Long id, @RequestBody Map<String, Object> showtimeData) {
        try {
            Object result = showtimeService.updateShowtime(id, showtimeData);
            return ResponseEntity.ok(new ResponseObject("200", "Showtime updated successfully!", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating showtime: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseObject> deleteShowtime(@PathVariable Long id) {
        try {
            showtimeService.deleteShowtime(id);
            return ResponseEntity.ok(new ResponseObject("200", "Showtime deleted successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error deleting showtime: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/can-delete")
    public ResponseEntity<ResponseObject> canDeleteShowtime(@PathVariable Long id) {
        try {
            boolean canDelete = showtimeService.canDeleteShowtime(id);
            String message = canDelete ? "Showtime can be deleted" : "Showtime cannot be deleted - has associated bookings";
            return ResponseEntity.ok(new ResponseObject("200", message, Map.of("canDelete", canDelete)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error checking showtime deletion: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/force")
    public ResponseEntity<ResponseObject> forceDeleteShowtime(@PathVariable Long id) {
        try {
            showtimeService.forceDeleteShowtime(id);
            return ResponseEntity.ok(new ResponseObject("200", "Showtime and all related data deleted successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error force deleting showtime: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/cascade")
    public ResponseEntity<ResponseObject> cascadeDeleteShowtime(@PathVariable Long id) {
        try {
            showtimeService.cascadeDeleteShowtime(id);
            return ResponseEntity.ok(new ResponseObject("200", "Showtime and all related data cascade deleted successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error cascade deleting showtime: " + e.getMessage(), null));
        }
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<ResponseObject> getShowtimesByRoom(@PathVariable Long roomId) {
        try {
            List<?> showtimes = showtimeService.getShowtimesByRoomId(roomId);
            return ResponseEntity.ok(new ResponseObject("200", "Showtimes retrieved successfully!", showtimes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving showtimes: " + e.getMessage(), null));
        }
    }

    @GetMapping("/cinema/{cinemaId}")
    public ResponseEntity<ResponseObject> getShowtimesByCinema(@PathVariable Long cinemaId) {
        try {
            List<?> showtimes = showtimeService.getShowtimesByCinemaId(cinemaId);
            return ResponseEntity.ok(new ResponseObject("200", "Showtimes retrieved successfully!", showtimes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving showtimes: " + e.getMessage(), null));
        }
    }

    @GetMapping("/movie/{movieId}/room/{roomId}")
    public ResponseEntity<ResponseObject> getShowtimesByMovieAndRoom(@PathVariable Long movieId, @PathVariable Long roomId) {
        try {
            List<?> showtimes = showtimeService.getShowtimesByMovieAndRoom(movieId, roomId);
            return ResponseEntity.ok(new ResponseObject("200", "Showtimes retrieved successfully!", showtimes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving showtimes: " + e.getMessage(), null));
        }
    }
}