package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.RoomDTO;
import com.project.cinema.movie.Models.Cinema;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.Room;
import com.project.cinema.movie.Services.CinemaService;
import com.project.cinema.movie.Services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room")
public class RoomController {
    @Autowired
    private RoomService roomService;
    @Autowired
    private CinemaService cinemaService;
    @GetMapping
    public List<Room> getAllRooms(){
        return roomService.getAllRooms();
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getRoomById(@PathVariable Long id) {
        Room room = roomService.getRoomById(id);
            return room != null? ResponseEntity.ok(
                    new ResponseObject("200", "Room found successfully!", room)
            )
            :ResponseEntity.status(404)
                    .body(new ResponseObject("404", "Room not found!", null));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ResponseObject> createRoom(@RequestBody RoomDTO roomDTO) {
        Cinema cinema = cinemaService.getCinemaById(roomDTO.getCinemaId());
        if (cinema == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("404", "Cinema not found!", null));
        }
        Room room = new Room();
        room.setName(roomDTO.getName());
        room.setCapacity(roomDTO.getCapacity());
        room.setCinema(cinema);

        // Lưu Room vào database
        Room newRoom = roomService.createRoom(room);

        return newRoom != null ? ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject("201", "Room created successfully!", newRoom))
                : ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ResponseObject("409", "Room name existed!", null));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable Long id){
        roomService.deleteRoom(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateRoom(@PathVariable Long id, @RequestBody Room room){
        Room newRoom = roomService.updateRoom(id,room);
        return ResponseEntity.ok(new ResponseObject("200","Updating room successfully!",newRoom));
    }

}
