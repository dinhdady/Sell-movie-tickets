package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShowtimeService {
    
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private CinemaRepository cinemaRepository;

    public List<Map<String, Object>> getShowtimesByMovieId(Long movieId) {
        List<Showtime> showtimes = showtimeRepository.findByMovieIdWithRoomAndCinema(movieId);
        return showtimes.stream().map(this::convertToMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getShowtimesByRoomId(Long roomId) {
        List<Showtime> showtimes = showtimeRepository.findByRoomId(roomId);
        return showtimes.stream().map(this::convertToMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getShowtimesByCinemaId(Long cinemaId) {
        List<Showtime> showtimes = showtimeRepository.findByCinemaId(cinemaId);
        return showtimes.stream().map(this::convertToMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getShowtimesByMovieAndRoom(Long movieId, Long roomId) {
        List<Showtime> showtimes = showtimeRepository.findByMovieIdWithRoomAndCinema(movieId);
        return showtimes.stream()
            .filter(showtime -> showtime.getRoom().getId().equals(roomId))
            .map(this::convertToMap)
            .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createShowtime(Map<String, Object> showtimeData) {
        try {
            // Validate required fields
            Long movieId = Long.valueOf(showtimeData.get("movieId").toString());
            Long roomId = Long.valueOf(showtimeData.get("roomId").toString());
            String startTimeStr = showtimeData.get("startTime").toString();
            String endTimeStr = showtimeData.get("endTime").toString();

            // Get movie and room
            Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
            Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

            // Parse dates
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
            Date startTime = sdf.parse(startTimeStr);
            Date endTime = sdf.parse(endTimeStr);

            // Create showtime
            Showtime showtime = new Showtime();
            showtime.setMovie(movie);
            showtime.setRoom(room);
            showtime.setStartTime(startTime);
            showtime.setEndTime(endTime);
            showtime.setCreatedAt(new Date());
            showtime.setUpdatedAt(new Date());

            Showtime savedShowtime = showtimeRepository.save(showtime);
            return convertToMap(savedShowtime);
        } catch (Exception e) {
            throw new RuntimeException("Error creating showtime: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> updateShowtime(Long id, Map<String, Object> showtimeData) {
        try {
            Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

            // Update fields if provided
            if (showtimeData.containsKey("movieId")) {
                Long movieId = Long.valueOf(showtimeData.get("movieId").toString());
                Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new RuntimeException("Movie not found"));
                showtime.setMovie(movie);
            }

            if (showtimeData.containsKey("roomId")) {
                Long roomId = Long.valueOf(showtimeData.get("roomId").toString());
                Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));
                showtime.setRoom(room);
            }

            if (showtimeData.containsKey("startTime")) {
                String startTimeStr = showtimeData.get("startTime").toString();
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
                Date startTime = sdf.parse(startTimeStr);
                showtime.setStartTime(startTime);
            }

            if (showtimeData.containsKey("endTime")) {
                String endTimeStr = showtimeData.get("endTime").toString();
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
                Date endTime = sdf.parse(endTimeStr);
                showtime.setEndTime(endTime);
            }

            showtime.setUpdatedAt(new Date());
            Showtime updatedShowtime = showtimeRepository.save(showtime);
            return convertToMap(updatedShowtime);
        } catch (Exception e) {
            throw new RuntimeException("Error updating showtime: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteShowtime(Long id) {
        try {
            Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
            showtimeRepository.delete(showtime);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting showtime: " + e.getMessage());
        }
    }

    private Map<String, Object> convertToMap(Showtime showtime) {
        Map<String, Object> showtimeMap = new HashMap<>();
        showtimeMap.put("id", showtime.getId());
        showtimeMap.put("startTime", showtime.getStartTime());
        showtimeMap.put("endTime", showtime.getEndTime());
        showtimeMap.put("createdAt", showtime.getCreatedAt());
        showtimeMap.put("updatedAt", showtime.getUpdatedAt());
        
        // Add movie info
        if (showtime.getMovie() != null) {
            Map<String, Object> movieInfo = new HashMap<>();
            movieInfo.put("id", showtime.getMovie().getId());
            movieInfo.put("title", showtime.getMovie().getTitle());
            movieInfo.put("duration", showtime.getMovie().getDuration());
            showtimeMap.put("movie", movieInfo);
        }
        
        // Add room info
        if (showtime.getRoom() != null) {
            Map<String, Object> roomInfo = new HashMap<>();
            roomInfo.put("id", showtime.getRoom().getId());
            roomInfo.put("name", showtime.getRoom().getName());
            roomInfo.put("capacity", showtime.getRoom().getCapacity());
            showtimeMap.put("roomId", showtime.getRoom().getId());
            showtimeMap.put("roomName", showtime.getRoom().getName());
            
            // Add cinema info
            if (showtime.getRoom().getCinema() != null) {
                Map<String, Object> cinemaInfo = new HashMap<>();
                cinemaInfo.put("id", showtime.getRoom().getCinema().getId());
                cinemaInfo.put("name", showtime.getRoom().getCinema().getName());
                cinemaInfo.put("address", showtime.getRoom().getCinema().getAddress());
                roomInfo.put("cinema", cinemaInfo);
                showtimeMap.put("cinemaId", showtime.getRoom().getCinema().getId());
                showtimeMap.put("cinemaName", showtime.getRoom().getCinema().getName());
            }
            
            showtimeMap.put("room", roomInfo);
        }
        
        return showtimeMap;
    }
}