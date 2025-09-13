package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.BookingDTO;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.ShowtimeRepository;
import com.project.cinema.movie.Services.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.project.cinema.movie.Models.Showtime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
public class BookingController {
    @Autowired
    private BookingService bookingService;
    @Autowired
    private UserService userService;
    @Autowired
    private ShowtimeRepository showtimeRepository;
    @Autowired
    private QRCodeService qrCodeService;
    @Autowired
    private OrderService orderService;
    @GetMapping
    public List<Booking> getAllBookings(){
        return bookingService.getAllBookings();
    }
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getBookingById(@PathVariable Long id){
        Booking booking = bookingService.getBookingById(id);
        return booking != null ? ResponseEntity.status(HttpStatus.FOUND).body(new ResponseObject("302","Found!",booking))
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseObject("404","Not found!",null));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseObject> deleteBookingById(@PathVariable Long id){
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(new ResponseObject("OK","Deleted successfully!",null));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateBookingById(@PathVariable Long id, @RequestBody Booking booking){
        Booking newBooking = bookingService.updateBooking(id,booking);
        return ResponseEntity.status(HttpStatus.OK).body(new ResponseObject("200","Updated successfully!",newBooking));
    }
    @PostMapping
    public ResponseEntity<ResponseObject> createBooking(@RequestBody BookingDTO bookingDTO) {
        System.out.println("[BookingController] Received bookingDTO: " + bookingDTO);
        Showtime showtime = showtimeRepository.findById(bookingDTO.getShowtimeId()).orElse(null);

        if (showtime == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Showtime không hợp lệ.", null));
        }

        // Tạo một Booking mới nhưng không gắn với Order
        Booking booking = new Booking();
        
        // For guest bookings, user can be null
        if (bookingDTO.getUserId() != null) {
            User user = userService.findByUserId(bookingDTO.getUserId()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("400", "User không hợp lệ.", null));
            }
            booking.setUser(user);
        } else {
            booking.setUser(null); // Guest booking - no user associated
        }
        
        booking.setShowtime(showtime);
        booking.setTotalPrice(bookingDTO.getTotalPrice());
        booking.setStatus(BookingStatus.PENDING); // Trạng thái chờ thanh toán
        booking.setCustomerName(bookingDTO.getCustomerName());
        booking.setCustomerEmail(bookingDTO.getCustomerEmail());
        booking.setCustomerPhone(bookingDTO.getCustomerPhone());
        booking.setCustomerAddress(bookingDTO.getCustomerAddress());

        Booking savedBooking = bookingService.save(booking);

        // Lưu thông tin seatIds vào booking để sử dụng sau khi thanh toán thành công
        // Không gán ghế ngay lập tức, chỉ lưu thông tin seatIds
        if (bookingDTO.getSeatIds() != null && !bookingDTO.getSeatIds().isEmpty()) {
            System.out.println("[BookingController] Saving seat IDs for later assignment: " + bookingDTO.getSeatIds());
            savedBooking.setSeatIds(bookingDTO.getSeatIds());
            bookingService.save(savedBooking); // Save the booking with seat IDs
        } else {
            System.out.println("[BookingController] No seat IDs to save for booking ID: " + savedBooking.getId());
        }

        return ResponseEntity.ok(new ResponseObject("201", "Create booking successfully!", savedBooking));
    }

    // Kiểm tra ghế có sẵn
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{showtimeId}/available-seats")
    public ResponseEntity<ResponseObject> getAvailableSeats(@PathVariable Long showtimeId) {
        try {
            List<String> availableSeats = bookingService.getAvailableSeats(showtimeId);
            return ResponseEntity.ok(new ResponseObject("200", "Available seats retrieved successfully!", availableSeats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving available seats: " + e.getMessage(), null));
        }
    }

    // Kiểm tra ghế đã đặt
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{showtimeId}/booked-seats")
    public ResponseEntity<ResponseObject> getBookedSeats(@PathVariable Long showtimeId) {
        try {
            List<String> bookedSeats = bookingService.getBookedSeats(showtimeId);
            return ResponseEntity.ok(new ResponseObject("200", "Booked seats retrieved successfully!", bookedSeats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving booked seats: " + e.getMessage(), null));
        }
    }

    // Đặt vé với validation
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping("/validate")
    public ResponseEntity<ResponseObject> validateBooking(@RequestBody BookingDTO bookingDTO) {
        try {
            Map<String, Object> validationResult = bookingService.validateBooking(bookingDTO);
            return ResponseEntity.ok(new ResponseObject("200", "Booking validation completed!", validationResult));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Booking validation failed: " + e.getMessage(), null));
        }
    }

    // Lấy lịch sử đặt vé của người dùng
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<ResponseObject> getUserBookingHistory(@PathVariable String userId) {
        try {
            List<Map<String, Object>> bookingHistory = bookingService.getUserBookingHistory(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User booking history retrieved successfully!", bookingHistory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving booking history: " + e.getMessage(), null));
        }
    }

    // Thống kê đặt vé
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<ResponseObject> getBookingStats() {
        try {
            Map<String, Object> stats = bookingService.getBookingStats();
            return ResponseEntity.ok(new ResponseObject("200", "Booking statistics retrieved successfully!", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving booking statistics: " + e.getMessage(), null));
        }
    }

    // Hủy đặt vé
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<ResponseObject> cancelBooking(@PathVariable Long bookingId) {
        try {
            Booking cancelledBooking = bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok(new ResponseObject("200", "Booking cancelled successfully!", cancelledBooking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error cancelling booking: " + e.getMessage(), null));
        }
    }

    // Xác nhận đặt vé
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<ResponseObject> confirmBooking(@PathVariable Long bookingId) {
        try {
            Booking confirmedBooking = bookingService.confirmBooking(bookingId);
            return ResponseEntity.ok(new ResponseObject("200", "Booking confirmed successfully!", confirmedBooking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error confirming booking: " + e.getMessage(), null));
        }
    }
}
