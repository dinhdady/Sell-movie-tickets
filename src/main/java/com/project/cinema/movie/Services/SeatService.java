package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.SeatDTO;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.BookingRepository;
import com.project.cinema.movie.Repositories.RoomRepository;
import com.project.cinema.movie.Repositories.SeatRepository;
import com.project.cinema.movie.Repositories.ShowtimeSeatBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ShowtimeSeatBookingRepository showtimeSeatBookingRepository;

    // Lấy ghế có sẵn theo phòng (tất cả ghế trong phòng)
    public List<Seat> getAvailableSeatsByRoom(Long roomId) {
        return seatRepository.findByRoomId(roomId);
    }

    // Lấy ghế đã đặt theo phòng (không còn sử dụng vì trạng thái ghế đã được chuyển sang showtime seat bookings)
    public List<Seat> getBookedSeatsByRoom(Long roomId) {
        // Trả về danh sách rỗng vì trạng thái booking bây giờ được quản lý ở showtime seat bookings
        return List.of();
    }

    // Kiểm tra ghế có sẵn không (chỉ kiểm tra xem ghế có tồn tại)
    public boolean isSeatAvailable(String seatNumber, Long roomId) {
        Seat seat = seatRepository.findBySeatNumberAndRoom(seatNumber, roomId);
        return seat != null;
    }

    // Đặt ghế (cần showtimeId để tạo showtime-specific booking)
    public void bookSeat(String seatNumber, Long roomId, Long bookingId, Long showtimeId) {
        Seat seat = seatRepository.findBySeatNumberAndRoom(seatNumber, roomId);
        
        if (seat == null) {
            throw new RuntimeException("Seat not found: " + seatNumber);
        }
        
        // Lấy booking
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found: " + bookingId);
        }
        
        // Kiểm tra xem ghế đã được đặt cho showtime này chưa
        if (showtimeSeatBookingRepository.isSeatBookedForShowtime(showtimeId, seat.getId())) {
            throw new RuntimeException("Seat is already booked for this showtime: " + seatNumber);
        }
        
        // Tạo showtime seat booking record
        ShowtimeSeatBooking showtimeSeatBooking = new ShowtimeSeatBooking();
        showtimeSeatBooking.setShowtime(bookingOpt.get().getShowtime());
        showtimeSeatBooking.setSeat(seat);
        showtimeSeatBooking.setBooking(bookingOpt.get());
        showtimeSeatBooking.setStatus(SeatStatus.BOOKED);
        
        showtimeSeatBookingRepository.save(showtimeSeatBooking);
    }

    // Giải phóng ghế (cần showtimeId để xóa showtime-specific booking)
    public void releaseSeat(String seatNumber, Long roomId, Long showtimeId) {
        Seat seat = seatRepository.findBySeatNumberAndRoom(seatNumber, roomId);
        
        if (seat == null) {
            throw new RuntimeException("Seat not found: " + seatNumber);
        }
        
        // Xóa showtime seat booking record
        ShowtimeSeatBooking booking = showtimeSeatBookingRepository.findByShowtimeIdAndSeatId(showtimeId, seat.getId());
        if (booking != null) {
            showtimeSeatBookingRepository.delete(booking);
        }
    }

    // Đếm ghế theo trạng thái (không còn sử dụng vì trạng thái ghế đã được chuyển sang showtime seat bookings)
    public Long countSeatsByStatus(Long roomId, SeatStatus status) {
        return 0L;
    }

    // Lấy ghế theo booking (sử dụng showtime seat bookings)
    public List<Seat> getSeatsByBooking(Long bookingId) {
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        return seatBookings.stream()
            .map(ShowtimeSeatBooking::getSeat)
            .toList();
    }

    // Tạo ghế mới cho phòng
    public Seat createSeat(String seatNumber, String rowNumber, Integer columnNumber, Long roomId) {
        // Kiểm tra ghế đã tồn tại chưa
        if (seatRepository.existsBySeatNumberAndRoomId(seatNumber, roomId)) {
            throw new RuntimeException("Seat already exists: " + seatNumber);
        }
        
        // Tạo ghế mới (cần Room object)
        // Seat seat = new Seat(seatNumber, rowNumber, columnNumber, room);
        // return seatRepository.save(seat);
        
        // Tạm thời return null vì cần Room object
        throw new RuntimeException("Method not fully implemented - needs Room object");
    }

    // ========== CRUD METHODS FOR CONTROLLER ==========
    
    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    public Seat getSeatById(Long id) {
        return seatRepository.findById(id).orElse(null);
    }

    public Seat createSeat(SeatDTO seatDTO) {
        // Kiểm tra ghế đã tồn tại chưa
        if (seatRepository.existsBySeatNumberAndRoomId(seatDTO.getSeatNumber(), seatDTO.getRoomId())) {
            throw new RuntimeException("Seat already exists: " + seatDTO.getSeatNumber());
        }

        // Tạo ghế mới với seat type
        Seat seat = new Seat();
        seat.setSeatNumber(seatDTO.getSeatNumber());
        seat.setRowNumber(seatDTO.getRowNumber());
        seat.setColumnNumber(seatDTO.getColumnNumber());
        seat.setSeatType(seatDTO.getSeatType() != null ? seatDTO.getSeatType() : SeatType.REGULAR);

        return seatRepository.save(seat);
    }

    public void deleteSeat(Long id) {
        seatRepository.deleteById(id);
    }

    public Seat updateSeat(Long id, Seat seatDetails) {
        Seat seat = seatRepository.findById(id).orElse(null);
        
        if (seat != null) {
            // Kiểm tra ghế đã tồn tại chưa
            boolean seatExists = seatRepository.existsBySeatNumberAndRoomId(
                seatDetails.getSeatNumber(), seatDetails.getRoom().getId()
            );
            
            if (seatExists && !seat.getId().equals(id)) {
                throw new RuntimeException("A seat with the same seat number already exists in this room.");
            }
            
            // Cập nhật thông tin ghế (không cập nhật trạng thái vì đã được chuyển sang showtime seat bookings)
            seat.setSeatNumber(seatDetails.getSeatNumber());
            seat.setRowNumber(seatDetails.getRowNumber());
            seat.setColumnNumber(seatDetails.getColumnNumber());
            seat.setSeatType(seatDetails.getSeatType());
            
            return seatRepository.save(seat);
        }
        
        return null;
    }

    // Get all seats for a specific room
    public List<Seat> getSeatsByRoomId(Long roomId) {
        return seatRepository.findByRoomId(roomId);
    }

    // Get seats with availability status for a specific showtime and room
    public List<Seat> getSeatsWithAvailability(Long showtimeId, Long roomId) {
        List<Seat> allSeats = seatRepository.findByRoomId(roomId);
        
        // Check availability for each seat based on actual bookings
        for (Seat seat : allSeats) {
            ShowtimeSeatBooking booking = showtimeSeatBookingRepository.findByShowtimeIdAndSeatId(showtimeId, seat.getId());
            if (booking != null && booking.getStatus() == SeatStatus.BOOKED) {
                seat.setStatus("BOOKED");
            } else {
                // All seats are available by default since database has all seats as available
                seat.setStatus("AVAILABLE");
            }
        }
        
        return allSeats;
    }

    // Get only available seats for a specific showtime
    public List<Seat> getAvailableSeats(Long showtimeId) {
        List<Seat> availableSeats = new ArrayList<>();
        List<Seat> allSeats = seatRepository.findAll();
        
        for (Seat seat : allSeats) {
            ShowtimeSeatBooking booking = showtimeSeatBookingRepository.findByShowtimeIdAndSeatId(showtimeId, seat.getId());
            if (booking == null || booking.getStatus() != SeatStatus.BOOKED) {
                seat.setStatus("AVAILABLE");
                availableSeats.add(seat);
            }
        }
        
        return availableSeats;
    }
}
