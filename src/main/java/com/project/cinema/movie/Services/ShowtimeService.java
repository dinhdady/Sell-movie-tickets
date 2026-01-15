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
    private BookingRepository bookingRepository;
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ShowtimeSeatBookingRepository showtimeSeatBookingRepository;

    public Optional<Showtime> findById(Long id) {
        return showtimeRepository.findById(id);
    }

    public List<Map<String, Object>> getShowtimesByMovieId(Long movieId) {
        List<Showtime> showtimes = showtimeRepository.findByMovieIdWithRoomAndCinema(movieId);
        return filterActiveShowtimes(showtimes);
    }

    public List<Map<String, Object>> getShowtimesByRoomId(Long roomId) {
        List<Showtime> showtimes = showtimeRepository.findByRoomId(roomId);
        return filterActiveShowtimes(showtimes);
    }

    public List<Map<String, Object>> getShowtimesByCinemaId(Long cinemaId) {
        List<Showtime> showtimes = showtimeRepository.findByCinemaId(cinemaId);
        return filterActiveShowtimes(showtimes);
    }

    public List<Map<String, Object>> getShowtimesByMovieAndRoom(Long movieId, Long roomId) {
        List<Showtime> showtimes = showtimeRepository.findByMovieIdWithRoomAndCinema(movieId);
        return showtimes.stream()
            .filter(showtime -> showtime.getRoom().getId().equals(roomId))
            .collect(Collectors.toList())
            .stream()
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
    public Map<String, Object> createRecurringShowtimes(Map<String, Object> showtimeData) {
        try {
            // Validate required fields
            Long movieId = Long.valueOf(showtimeData.get("movieId").toString());
            Long roomId = Long.valueOf(showtimeData.get("roomId").toString());
            String startDateStr = showtimeData.get("startDate").toString(); // yyyy-MM-dd
            String endDateStr = showtimeData.get("endDate").toString(); // yyyy-MM-dd
            String startTimeStr = showtimeData.get("startTime").toString(); // HH:mm
            String endTimeStr = showtimeData.get("endTime").toString(); // HH:mm

            // Get movie and room
            Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
            Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

            // Parse dates
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);
            Date startTimeOnly = timeFormat.parse(startTimeStr);
            Date endTimeOnly = timeFormat.parse(endTimeStr);

            // Extract hours and minutes from time
            Calendar startTimeCal = Calendar.getInstance();
            startTimeCal.setTime(startTimeOnly);
            int startHour = startTimeCal.get(Calendar.HOUR_OF_DAY);
            int startMinute = startTimeCal.get(Calendar.MINUTE);

            Calendar endTimeCal = Calendar.getInstance();
            endTimeCal.setTime(endTimeOnly);
            int endHour = endTimeCal.get(Calendar.HOUR_OF_DAY);
            int endMinute = endTimeCal.get(Calendar.MINUTE);

            // Calculate duration in minutes
            long durationMinutes = ((endHour * 60) + endMinute) - ((startHour * 60) + startMinute);
            if (durationMinutes <= 0) {
                throw new RuntimeException("End time must be after start time");
            }

            // Create showtimes for each day
            List<Showtime> createdShowtimes = new ArrayList<>();
            Calendar currentDate = Calendar.getInstance();
            currentDate.setTime(startDate);
            currentDate.set(Calendar.HOUR_OF_DAY, 0);
            currentDate.set(Calendar.MINUTE, 0);
            currentDate.set(Calendar.SECOND, 0);
            currentDate.set(Calendar.MILLISECOND, 0);

            Calendar endDateCal = Calendar.getInstance();
            endDateCal.setTime(endDate);
            endDateCal.set(Calendar.HOUR_OF_DAY, 23);
            endDateCal.set(Calendar.MINUTE, 59);
            endDateCal.set(Calendar.SECOND, 59);
            endDateCal.set(Calendar.MILLISECOND, 999);

            while (!currentDate.after(endDateCal)) {
                // Set start time for this day
                Calendar showtimeStart = (Calendar) currentDate.clone();
                showtimeStart.set(Calendar.HOUR_OF_DAY, startHour);
                showtimeStart.set(Calendar.MINUTE, startMinute);
                showtimeStart.set(Calendar.SECOND, 0);
                showtimeStart.set(Calendar.MILLISECOND, 0);

                // Set end time for this day
                Calendar showtimeEnd = (Calendar) showtimeStart.clone();
                showtimeEnd.add(Calendar.MINUTE, (int) durationMinutes);

                // Create showtime
                Showtime showtime = new Showtime();
                showtime.setMovie(movie);
                showtime.setRoom(room);
                showtime.setStartTime(showtimeStart.getTime());
                showtime.setEndTime(showtimeEnd.getTime());
                showtime.setStatus("ACTIVE"); // Explicitly set status
                showtime.setCreatedAt(new Date());
                showtime.setUpdatedAt(new Date());

                Showtime savedShowtime = showtimeRepository.save(showtime);
                createdShowtimes.add(savedShowtime);

                // Move to next day
                currentDate.add(Calendar.DAY_OF_MONTH, 1);
            }

            // Return summary
            Map<String, Object> result = new HashMap<>();
            result.put("count", createdShowtimes.size());
            result.put("showtimes", createdShowtimes.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList()));
            result.put("startDate", startDateStr);
            result.put("endDate", endDateStr);
            result.put("startTime", startTimeStr);
            result.put("endTime", endTimeStr);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("Error creating recurring showtimes: " + e.getMessage());
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
            
            // Kiểm tra xem có booking nào đang sử dụng showtime này không
            List<Booking> bookings = bookingRepository.findByShowtimeId(id);
            if (!bookings.isEmpty()) {
                throw new RuntimeException("Cannot delete showtime: There are " + bookings.size() + " bookings associated with this showtime. Please delete the bookings first.");
            }
            
            // Xóa các ShowtimeSeatBooking liên quan trước
            List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByShowtimeId(id);
            for (ShowtimeSeatBooking seatBooking : seatBookings) {
                showtimeSeatBookingRepository.delete(seatBooking);
            }
            
            // Sau đó mới xóa showtime
            showtimeRepository.delete(showtime);
            
            System.out.println("[ShowtimeService] Successfully deleted showtime ID: " + id);
        } catch (Exception e) {
            System.err.println("[ShowtimeService] Error deleting showtime ID " + id + ": " + e.getMessage());
            throw new RuntimeException("Error deleting showtime: " + e.getMessage());
        }
    }

    public boolean canDeleteShowtime(Long id) {
        try {
            // Kiểm tra xem có booking nào đang sử dụng showtime này không
            List<Booking> bookings = bookingRepository.findByShowtimeId(id);
            return bookings.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Xóa showtime và tất cả dữ liệu liên quan (chỉ dùng cho admin)
     */
    @Transactional
    public void forceDeleteShowtime(Long id) {
        try {
            Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
            
            System.out.println("[ShowtimeService] Force deleting showtime ID: " + id);
            
            // 1. Xóa tất cả ShowtimeSeatBooking
            List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByShowtimeId(id);
            System.out.println("[ShowtimeService] Found " + seatBookings.size() + " seat bookings to delete");
            for (ShowtimeSeatBooking seatBooking : seatBookings) {
                showtimeSeatBookingRepository.delete(seatBooking);
            }
            
            // 2. Xóa tất cả Bookings liên quan
            List<Booking> bookings = bookingRepository.findByShowtimeId(id);
            System.out.println("[ShowtimeService] Found " + bookings.size() + " bookings to delete");
            for (Booking booking : bookings) {
                // Xóa tickets liên quan
                if (booking.getOrder() != null) {
                    List<Ticket> tickets = ticketRepository.findByOrderId(booking.getOrder().getId());
                    for (Ticket ticket : tickets) {
                        ticketRepository.delete(ticket);
                    }
                    
                    // Xóa order
                    orderRepository.delete(booking.getOrder());
                }
                
                // Xóa booking
                bookingRepository.delete(booking);
            }
            
            // 3. Cuối cùng xóa showtime
            showtimeRepository.delete(showtime);
            
        } catch (Exception e) {
            System.err.println("[ShowtimeService] Error force deleting showtime ID " + id + ": " + e.getMessage());
            throw new RuntimeException("Error force deleting showtime: " + e.getMessage());
        }
    }

    /**
     * Xóa showtime với cascade delete (sử dụng native query)
     */
    @Transactional
    public void cascadeDeleteShowtime(Long id) {
        try {
            System.out.println("[ShowtimeService] Cascade deleting showtime ID: " + id);
            
            // Sử dụng native query để xóa theo thứ tự đúng
            // 1. Xóa ShowtimeSeatBooking
            showtimeSeatBookingRepository.deleteByShowtimeId(id);
            
            // 2. Xóa Tickets
            ticketRepository.deleteByShowtimeId(id);
            
            // 3. Xóa Orders
            orderRepository.deleteByShowtimeId(id);
            
            // 4. Xóa Bookings
            bookingRepository.deleteByShowtimeId(id);
            
            // 5. Xóa Showtime
            showtimeRepository.deleteById(id);
            
        } catch (Exception e) {
            throw new RuntimeException("Error cascade deleting showtime: " + e.getMessage());
        }
    }

    // Filter to show only active showtimes (endTime > now) for room display
    private List<Map<String, Object>> filterActiveShowtimes(List<Showtime> showtimes) {
        Date now = new Date();
        
        List<Map<String, Object>> filteredShowtimes = showtimes.stream()
            .filter(showtime -> {
                // Check if endTime is not null before calling after()
                if (showtime.getEndTime() == null) {
                    System.out.println("[ShowtimeService] Showtime ID: " + showtime.getId() + 
                        " has null endTime, skipping");
                    return false;
                }
                boolean isActive = showtime.getEndTime().after(now);
                long timeDiff = showtime.getEndTime().getTime() - now.getTime();
                System.out.println("[ShowtimeService] Showtime ID: " + showtime.getId() + 
                    ", StartTime: " + showtime.getStartTime() + 
                    ", EndTime: " + showtime.getEndTime() +
                    ", TimeDiff: " + timeDiff + "ms" +
                    ", IsActive: " + isActive);
                return isActive;
            })
            .map(this::convertToMap)
            .collect(Collectors.toList());
            
        return filteredShowtimes;
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