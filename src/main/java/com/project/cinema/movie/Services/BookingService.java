package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.BookingDTO;
import com.project.cinema.movie.Exception.ResourceNotFoundException;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ShowtimeRepository showtimeRepository;
    @Autowired
    private SeatRepository seatRepository;
    
    @Autowired
    private ShowtimeSeatBookingRepository showtimeSeatBookingRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public Booking createBooking(BookingDTO bookingDTO) {
        User user = userRepository.findById(bookingDTO.getUserId()).orElseThrow(() -> new RuntimeException("User id not found"));
        Showtime showtime = showtimeRepository.findById(bookingDTO.getShowtimeId()).orElseThrow(() -> new RuntimeException("Showtime id not found"));
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShowtime(showtime);
        booking.setTotalPrice(bookingDTO.getTotalPrice());
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Booking bookingDetails) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setTotalPrice(bookingDetails.getTotalPrice());
            return bookingRepository.save(booking);
        }).orElseThrow(() -> new ResourceNotFoundException("Cinema cannot be found with id :" + id));
    }

    public Booking save(Booking booking){
        return bookingRepository.save(booking);
    }
    
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    @Transactional
    public void assignSeatsToBooking(Booking booking, List<Long> seatIds) {
        System.out.println("[BookingService] Assigning seats to booking ID: " + booking.getId());
        System.out.println("[BookingService] Seat IDs to assign: " + seatIds);
        
        if (seatIds == null || seatIds.isEmpty()) {
            System.out.println("[BookingService] No seat IDs provided for booking ID: " + booking.getId());
            return;
        }
        
        for (Long seatId : seatIds) {
            try {
                Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + seatId));
                
                System.out.println("[BookingService] Found seat: " + seat.getSeatNumber());
                
                // Check if seat is already booked for this showtime
                ShowtimeSeatBooking existingBooking = showtimeSeatBookingRepository
                    .findByShowtimeIdAndSeatId(booking.getShowtime().getId(), seatId);
                
                if (existingBooking != null && existingBooking.getStatus() == SeatStatus.BOOKED) {
                    throw new IllegalStateException("Seat " + seat.getSeatNumber() + " is already booked for this showtime.");
                }
                
                // Create or update showtime seat booking record
                ShowtimeSeatBooking showtimeSeatBooking;
                if (existingBooking != null) {
                    showtimeSeatBooking = existingBooking;
                } else {
                    showtimeSeatBooking = new ShowtimeSeatBooking();
                    showtimeSeatBooking.setShowtime(booking.getShowtime());
                    showtimeSeatBooking.setSeat(seat);
                }
                
                showtimeSeatBooking.setBooking(booking);
                showtimeSeatBooking.setStatus(SeatStatus.BOOKED);
                
                showtimeSeatBookingRepository.save(showtimeSeatBooking);
                
                System.out.println("[BookingService] Seat " + seat.getSeatNumber() + " assigned to booking ID: " + booking.getId());
            } catch (Exception e) {
                System.out.println("[BookingService] Error assigning seat ID " + seatId + ": " + e.getMessage());
                throw e;
            }
        }
    }

    public List<Booking> getBookingsByShowtimeId(Long showtimeId) {
        return bookingRepository.findByShowtimeId(showtimeId);
    }

    // ========== ENHANCED BOOKING METHODS ==========

    // Lấy ghế có sẵn cho suất chiếu
    public List<String> getAvailableSeats(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        // Lấy tất cả ghế trong phòng
        List<Seat> allSeats = seatRepository.findByRoomId(showtime.getRoom().getId());
        
        // Lấy ghế đã đặt cho suất chiếu này
        List<ShowtimeSeatBooking> bookedSeats = showtimeSeatBookingRepository.findByShowtimeId(showtimeId);
        Set<Long> bookedSeatIds = new HashSet<>();
        for (ShowtimeSeatBooking booking : bookedSeats) {
            if (booking.getStatus() == SeatStatus.BOOKED) {
                bookedSeatIds.add(booking.getSeat().getId());
            }
        }
        
        // Lọc ghế có sẵn (tất cả ghế không bị booked cho showtime này)
        List<String> availableSeats = new ArrayList<>();
        for (Seat seat : allSeats) {
            if (!bookedSeatIds.contains(seat.getId())) {
                availableSeats.add(seat.getSeatNumber());
            }
        }
        
        return availableSeats;
    }

    // Lấy ghế đã đặt cho suất chiếu
    public List<String> getBookedSeats(Long showtimeId) {
        List<ShowtimeSeatBooking> bookedSeats = showtimeSeatBookingRepository.findByShowtimeId(showtimeId);
        List<String> bookedSeatNumbers = new ArrayList<>();
        
        for (ShowtimeSeatBooking booking : bookedSeats) {
            bookedSeatNumbers.add(booking.getSeat().getSeatNumber());
        }
        
        return bookedSeatNumbers;
    }

    // ========== ADMIN MANAGEMENT METHODS ==========

    public Page<Booking> getAllBookingsWithFilters(int page, int size, String status, String movieTitle, String username) {
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.findAllWithFilters(pageable, status, movieTitle, username);
    }

    public Map<String, Object> getBookingDetails(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Map<String, Object> details = new HashMap<>();
        details.put("id", booking.getId());
        details.put("user", booking.getUser());
        details.put("showtime", booking.getShowtime());
        details.put("totalPrice", booking.getTotalPrice());
        details.put("status", booking.getStatus());
        details.put("createdAt", booking.getCreatedAt());
        
        // Lấy thông tin ghế từ showtime seat bookings
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        List<String> seatNumbers = new ArrayList<>();
        for (ShowtimeSeatBooking seatBooking : seatBookings) {
            seatNumbers.add(seatBooking.getSeat().getSeatNumber());
        }
        details.put("seatNumbers", seatNumbers);
        
        return details;
    }

    public Booking updateBookingStatus(Long bookingId, String newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(BookingStatus.valueOf(newStatus));
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Giải phóng ghế từ showtime seat bookings
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        for (ShowtimeSeatBooking seatBooking : seatBookings) {
            showtimeSeatBookingRepository.delete(seatBooking);
        }
        
        // Cập nhật trạng thái booking
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public Map<String, Object> getBookingStats(String period) {
        Map<String, Object> stats = new HashMap<>();
        
        // Thống kê theo thời gian
        if ("today".equals(period)) {
            Date today = java.sql.Date.valueOf(LocalDate.now());
            Long todayBookings = bookingRepository.countByCreatedDateBetween(today, today);
            Double todayRevenue = bookingRepository.calculateRevenueBetweenDates(today, today);
            stats.put("bookings", todayBookings != null ? todayBookings : 0L);
            stats.put("revenue", todayRevenue != null ? todayRevenue : 0.0);
        } else if ("week".equals(period)) {
            Date weekStart = java.sql.Date.valueOf(LocalDate.now().minusDays(7));
            Date today = java.sql.Date.valueOf(LocalDate.now());
            Long weekBookings = bookingRepository.countByCreatedDateBetween(weekStart, today);
            Double weekRevenue = bookingRepository.calculateRevenueBetweenDates(weekStart, today);
            stats.put("bookings", weekBookings != null ? weekBookings : 0L);
            stats.put("revenue", weekRevenue != null ? weekRevenue : 0.0);
        } else {
            // Thống kê tổng
            Long totalBookings = bookingRepository.count();
            Double totalRevenue = bookingRepository.calculateTotalRevenue();
            stats.put("totalBookings", totalBookings);
            stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        }
        
        return stats;
    }

    public Map<String, Object> getShowtimeSeatInfo(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        Map<String, Object> seatInfo = new HashMap<>();
        seatInfo.put("showtime", showtime);
        seatInfo.put("availableSeats", getAvailableSeats(showtimeId));
        seatInfo.put("bookedSeats", getBookedSeats(showtimeId));
        
        return seatInfo;
    }

    public Page<Booking> searchBookings(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.searchBookings(query, pageable);
    }

    public Map<String, Object> exportBookings(String startDate, String endDate, String format) {
        Map<String, Object> exportData = new HashMap<>();
        
        // Logic xuất báo cáo (có thể implement sau)
        exportData.put("message", "Export functionality will be implemented");
        exportData.put("startDate", startDate);
        exportData.put("endDate", endDate);
        exportData.put("format", format);
        
        return exportData;
    }

    // Lấy lịch sử đặt vé của người dùng
    public List<Map<String, Object>> getUserBookingHistory(String userId) {
        List<Map<String, Object>> history = new ArrayList<>();
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        
        for (Booking booking : bookings) {
            Map<String, Object> bookingInfo = new HashMap<>();
            bookingInfo.put("id", booking.getId());
            bookingInfo.put("totalPrice", booking.getTotalPrice());
            bookingInfo.put("createdAt", booking.getCreatedAt());
            bookingInfo.put("movieTitle", booking.getShowtime().getMovie().getTitle());
            bookingInfo.put("showtime", booking.getShowtime().getStartTime());
            bookingInfo.put("status", booking.getStatus());
            
            history.add(bookingInfo);
        }
        
        return history;
    }

    // Thống kê đặt vé (method cũ)
    public Map<String, Object> getBookingStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Long totalBookings = bookingRepository.count();
        Double totalRevenue = bookingRepository.calculateTotalRevenue();
        Long todayBookings = bookingRepository.countByCreatedDateAfter(new Date());
        
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        stats.put("todayBookings", todayBookings);
        
        return stats;
    }

    // Xác nhận đặt vé
    public Booking confirmBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        // Cập nhật trạng thái đặt vé
        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    // Validate đặt vé
    public Map<String, Object> validateBooking(BookingDTO bookingDTO) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        
        // Kiểm tra user tồn tại
        User user = userRepository.findById(bookingDTO.getUserId()).orElse(null);
        if (user == null) {
            errors.add("User not found");
        }
        
        // Kiểm tra showtime tồn tại
        Showtime showtime = showtimeRepository.findById(bookingDTO.getShowtimeId()).orElse(null);
        if (showtime == null) {
            errors.add("Showtime not found");
        }
        
        // Kiểm tra giá vé
        if (bookingDTO.getTotalPrice() <= 0) {
            errors.add("Invalid price");
        }
        
        // Kiểm tra ghế có sẵn (nếu có thông tin ghế)
        if (bookingDTO.getSeatIds() != null && !bookingDTO.getSeatIds().isEmpty()) {
            for (Long seatId : bookingDTO.getSeatIds()) {
                Optional<Seat> seatOpt = seatRepository.findById(seatId);
                if (!seatOpt.isPresent()) {
                    errors.add("Seat with ID " + seatId + " not found");
                }
                // Kiểm tra thêm xem ghế có sẵn cho showtime này không
                else if (showtimeSeatBookingRepository.isSeatBookedForShowtime(bookingDTO.getShowtimeId(), seatId)) {
                    errors.add("Seat " + seatOpt.get().getSeatNumber() + " is not available for this showtime");
                }
            }
        }
        
        result.put("valid", errors.isEmpty());
        result.put("errors", errors);
        
        return result;
    }
}
