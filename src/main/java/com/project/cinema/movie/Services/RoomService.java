package com.project.cinema.movie.Services;

import com.project.cinema.movie.Exception.ResourceNotFoundException;
import com.project.cinema.movie.Models.Room;
import com.project.cinema.movie.Repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id).orElse(null);
    }

    public Room createRoom(Room room) {
        Optional<Room> found = roomRepository.findByName(room.getName());
        return found.isEmpty() ? roomRepository.save(room) : null;
    }

    public Room updateRoom(Long id, Room roomDetails) {
        return roomRepository.findById(id).map(room -> {
            room.setName(roomDetails.getName());
            room.setCapacity(roomDetails.getCapacity());
            return roomRepository.save(room);
        }).orElseThrow(() -> new ResourceNotFoundException("Room cannot be found :" + id));
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    public List<Room> getRoomsByCinemaId(Long cinemaId) {
        return roomRepository.findByCinemaId(cinemaId);
    }
}
