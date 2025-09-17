package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.SeatDTO;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.Seat;
import com.project.cinema.movie.Services.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seat")
public class SeatController {
    @Autowired
    private SeatService seatService;
    @GetMapping
    public List<Seat> getAlllistSeat(){
        return seatService.getAllSeats();
    }
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getSeatById(@PathVariable Long id){
        Seat found = seatService.getSeatById(id);
        return found != null ? ResponseEntity.status(HttpStatus.FOUND).body(new ResponseObject("302","Found!",found))
                :ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseObject("404","Not found!",null));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ResponseObject> createSeat(@RequestBody SeatDTO seatDTO){
        Seat newSeat = seatService.createSeat(seatDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseObject("201","Created!",newSeat));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteSeat(@PathVariable Long id){
        seatService.deleteSeat(id);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateSeat(@PathVariable Long id, @RequestBody Seat seat){
        Seat updatedSeat = seatService.updateSeat(id,seat);
        return ResponseEntity.status(HttpStatus.OK).body(new ResponseObject("200","Updated!",updatedSeat));
    }

    // Get all seats for a specific room
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ResponseObject> getSeatsByRoomId(@PathVariable Long roomId) {
        List<Seat> seats = seatService.getSeatsByRoomId(roomId);
        return ResponseEntity.ok(new ResponseObject("SUCCESS", "Seats retrieved successfully!", seats));
    }

    // Get seat availability for a specific showtime and room
    @GetMapping("/availability")
    public ResponseEntity<ResponseObject> getSeatAvailability(
            @RequestParam Long showtimeId, 
            @RequestParam Long roomId) {
        List<Seat> seats = seatService.getSeatsWithAvailability(showtimeId, roomId);
        return ResponseEntity.ok(new ResponseObject("SUCCESS", "Seat availability retrieved successfully!", seats));
    }

    // Get available seats for a specific showtime
    @GetMapping("/available/{showtimeId}")
    public ResponseEntity<ResponseObject> getAvailableSeats(@PathVariable Long showtimeId) {
        List<Seat> availableSeats = seatService.getAvailableSeats(showtimeId);
        return ResponseEntity.ok(new ResponseObject("SUCCESS", "Available seats retrieved successfully!", availableSeats));
    }
}
