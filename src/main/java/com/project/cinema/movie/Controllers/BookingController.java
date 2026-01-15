package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.BookingDTO;
import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.*;
import com.project.cinema.movie.Services.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.Date;

@RestController
@RequestMapping("/api/booking")
public class BookingController {
    @Autowired
    private BookingService bookingService;
    @Autowired
    private UserService userService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private ShowtimeService showtimeService;
    @Autowired
    private CouponService couponService;
    @Autowired
    private ShowtimeRepository showtimeRepository;
    @Autowired
    private ShowtimeSeatBookingRepository showtimeSeatBookingRepository;
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);
    @GetMapping
    public List<BookingDetailsResponse> getAllBookings(){
        return bookingService.getAllBookingsWithDetails();
    }
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getBookingById(@PathVariable Long id){
        Booking booking = bookingService.getBookingById(id);
        return booking != null ? ResponseEntity.status(HttpStatus.FOUND).body(new ResponseObject("302","Found!",booking))
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseObject("404","Not found!",null));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ResponseObject> getBookingDetailsById(@PathVariable Long id){
        try {
            BookingDetailsResponse bookingDetails = bookingService.getBookingDetailsById(id);
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Booking details retrieved successfully!", bookingDetails));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ResponseObject("ERROR", "Booking not found: " + e.getMessage(), null));
        }
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
        logger.info("[BookingController] Received bookingDTO: " + bookingDTO);
        
        try {
            // Validate showtime với logging chi tiết
            logger.info("[BookingController] Validating showtime ID: {}", bookingDTO.getShowtimeId());
            Showtime showtime = showtimeService.findById(bookingDTO.getShowtimeId()).orElse(null);
            if (showtime == null) {
                logger.error("[BookingController] Showtime ID {} not found in database", bookingDTO.getShowtimeId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("ERROR", "Showtime ID " + bookingDTO.getShowtimeId() + " không tồn tại trong hệ thống.", null));
            }
            
            // Validate showtime status
            if (showtime.getStatus() != null && !showtime.getStatus().equals("ACTIVE")) {
                logger.warn("[BookingController] Showtime ID {} has status: {}", bookingDTO.getShowtimeId(), showtime.getStatus());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("ERROR", "Suất chiếu này không còn hoạt động.", null));
            }
            
            logger.info("[BookingController] Showtime validation passed for ID: {}, Movie: {}, Room: {}", 
                bookingDTO.getShowtimeId(), 
                showtime.getMovie() != null ? showtime.getMovie().getTitle() : "N/A",
                showtime.getRoom() != null ? showtime.getRoom().getName() : "N/A");

            // Validate user
            User user = null;
            if (bookingDTO.getUserId() != null) {
                user = userService.findByUserId(bookingDTO.getUserId()).orElse(null);
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("ERROR", "User không hợp lệ.", null));
                }
            }

            // Check seat availability for this showtime
            if (bookingDTO.getSeatIds() != null && !bookingDTO.getSeatIds().isEmpty()) {
                boolean seatsAvailable = bookingService.checkSeatAvailability(bookingDTO.getShowtimeId(), bookingDTO.getSeatIds());
                if (!seatsAvailable) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("ERROR", "Một hoặc nhiều ghế đã được đặt cho suất chiếu này.", null));
                }
            }

            // Create booking
            Booking booking = new Booking();
            booking.setUser(user);
            booking.setShowtime(showtime);
            booking.setTotalPrice(bookingDTO.getTotalPrice());
            booking.setStatus(BookingStatus.PENDING);
            booking.setCustomerName(bookingDTO.getCustomerName());
            booking.setCustomerEmail(bookingDTO.getCustomerEmail());
            booking.setCustomerPhone(bookingDTO.getCustomerPhone());
            booking.setCustomerAddress(bookingDTO.getCustomerAddress());
            booking.setCouponCode(bookingDTO.getCouponCode());
            // Associate with existing Order if orderId is provided
            if (bookingDTO.getOrderId() != null) {
                Order order = orderService.findById(bookingDTO.getOrderId());

                booking.setOrder(order);
                logger.info("[BookingController] Associated booking with order ID: " + order.getId());
            }

            // Save booking first
            Booking savedBooking = bookingService.save(booking);

            // Reserve seats for this showtime
            if (bookingDTO.getSeatIds() != null && !bookingDTO.getSeatIds().isEmpty()) {
                bookingService.reserveSeats(savedBooking.getId(), bookingDTO.getShowtimeId(), bookingDTO.getSeatIds());
                logger.info("[BookingController] Reserved seats: " + bookingDTO.getSeatIds() + " for showtime: " + bookingDTO.getShowtimeId());
            }

            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Đặt vé thành công!", savedBooking));
            
        } catch (Exception e) {
            System.err.println("[BookingController] Error creating booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Lỗi khi tạo booking: " + e.getMessage(), null));
        }
    }

    // Confirm payment endpoint
    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<ResponseObject> confirmPayment(@PathVariable Long id) {
        try {
            bookingService.confirmPayment(id);
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Payment confirmed successfully!", null));
        } catch (Exception e) {
            logger.error("[BookingController] Error confirming payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Error confirming payment: " + e.getMessage(), null));
        }
    }

    // Cancel payment endpoint
    @PostMapping("/{id}/cancel-payment")
    public ResponseEntity<ResponseObject> cancelPayment(@PathVariable Long id) {
        try {
            bookingService.cancelPayment(id);
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Payment cancelled successfully!", null));
        } catch (Exception e) {
            logger.error("[BookingController] Error cancelling payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Error cancelling payment: " + e.getMessage(), null));
        }
    }

    // Test endpoint để test coupon usage
    @PostMapping("/test-coupon/{id}")
    public ResponseEntity<ResponseObject> testCouponUsage(@PathVariable Long id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("ERROR", "Booking not found", null));
            }
            
            if (booking.getCouponCode() == null || booking.getCouponCode().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("ERROR", "No coupon code found in booking", null));
            }
            
            logger.info("[BookingController] Testing coupon usage for booking ID: {} with coupon: {}", 
                id, booking.getCouponCode());
            
            Booking updatedBooking = bookingService.applyCouponDiscount(id, booking.getCouponCode());
            
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Coupon applied successfully", Map.of(
                "bookingId", updatedBooking.getId(),
                "couponCode", updatedBooking.getCouponCode(),
                "totalPrice", updatedBooking.getTotalPrice()
            )));
        } catch (Exception e) {
            logger.error("[BookingController] Error testing coupon usage: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Error testing coupon usage: " + e.getMessage(), null));
        }
    }

    // Manual endpoint để release seats for expired showtimes
    @PostMapping("/release-expired-seats")
    public ResponseEntity<ResponseObject> releaseExpiredSeats() {
        try {
            logger.info("[BookingController] Manual release expired seats called");
            bookingService.releaseSeatsForExpiredShowtimes();
            
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Expired seats released successfully", null));
        } catch (Exception e) {
            logger.error("[BookingController] Error releasing expired seats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Error releasing expired seats: " + e.getMessage(), null));
        }
    }

    // Debug endpoint để check expired showtimes
    @GetMapping("/debug-expired-showtimes")
    public ResponseEntity<ResponseObject> debugExpiredShowtimes() {
        try {
            logger.info("[BookingController] Debug expired showtimes called");
            
            // Get current time
            Date now = new Date();
            logger.info("[BookingController] Current time: {}", now);
            
            // Find expired showtimes
            List<Showtime> expiredShowtimes = showtimeRepository.findByEndTimeBefore(now);
            logger.info("[BookingController] Found {} expired showtimes", expiredShowtimes.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Showtime showtime : expiredShowtimes) {
                Map<String, Object> showtimeInfo = new HashMap<>();
                showtimeInfo.put("id", showtime.getId());
                showtimeInfo.put("movieName", showtime.getMovie().getTitle());
                showtimeInfo.put("startTime", showtime.getStartTime());
                showtimeInfo.put("endTime", showtime.getEndTime());
                
                // Count seat bookings
                List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByShowtimeId(showtime.getId());
                int bookedCount = 0;
                int reservedCount = 0;
                int availableCount = 0;
                
                for (ShowtimeSeatBooking seatBooking : seatBookings) {
                    if (seatBooking.getStatus() == SeatStatus.BOOKED) bookedCount++;
                    else if (seatBooking.getStatus() == SeatStatus.RESERVED) reservedCount++;
                    else if (seatBooking.getStatus() == SeatStatus.AVAILABLE) availableCount++;
                }
                
                showtimeInfo.put("bookedSeats", bookedCount);
                showtimeInfo.put("reservedSeats", reservedCount);
                showtimeInfo.put("availableSeats", availableCount);
                showtimeInfo.put("totalSeats", seatBookings.size());
                
                result.add(showtimeInfo);
            }
            
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Debug info retrieved", Map.of(
                "currentTime", now,
                "expiredShowtimesCount", expiredShowtimes.size(),
                "expiredShowtimes", result
            )));
        } catch (Exception e) {
            logger.error("[BookingController] Error debugging expired showtimes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Error debugging expired showtimes: " + e.getMessage(), null));
        }
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

    // Lấy thông tin chi tiết về seat status (bao gồm expired check)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{showtimeId}/seat-status")
    public ResponseEntity<ResponseObject> getSeatStatus(@PathVariable Long showtimeId) {
        try {
            logger.info("[BookingController] Getting seat status for showtime: {}", showtimeId);
            
            // Lấy thông tin showtime
            Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
            
            Date now = new Date();
            // Check if endTime is not null before calling before()
            boolean isExpired = showtime.getEndTime() != null && showtime.getEndTime().before(now);
            
            // Lấy danh sách ghế
            List<String> availableSeats = bookingService.getAvailableSeats(showtimeId);
            List<String> bookedSeats = bookingService.getBookedSeats(showtimeId);
            
            Map<String, Object> seatStatus = new HashMap<>();
            seatStatus.put("showtimeId", showtimeId);
            seatStatus.put("movieTitle", showtime.getMovie().getTitle());
            seatStatus.put("startTime", showtime.getStartTime());
            seatStatus.put("endTime", showtime.getEndTime());
            seatStatus.put("isExpired", isExpired);
            seatStatus.put("currentTime", now);
            seatStatus.put("availableSeats", availableSeats);
            seatStatus.put("bookedSeats", bookedSeats);
            seatStatus.put("totalAvailableSeats", availableSeats.size());
            seatStatus.put("totalBookedSeats", bookedSeats.size());
            
            logger.info("[BookingController] Seat status for showtime {}: expired={}, available={}, booked={}", 
                showtimeId, isExpired, availableSeats.size(), bookedSeats.size());
            
            return ResponseEntity.ok(new ResponseObject("200", "Seat status retrieved successfully!", seatStatus));
        } catch (Exception e) {
            logger.error("[BookingController] Error retrieving seat status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving seat status: " + e.getMessage(), null));
        }
    }

    // Kiểm tra trạng thái ghế khi chọn (real-time check)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping("/{showtimeId}/check-seat/{seatNumber}")
    public ResponseEntity<ResponseObject> checkSeatStatus(@PathVariable Long showtimeId, @PathVariable String seatNumber) {
        try {
            logger.info("[BookingController] Checking seat status for showtime: {} seat: {}", showtimeId, seatNumber);
            
            Map<String, Object> seatInfo = bookingService.checkSeatStatus(showtimeId, seatNumber);
            
            return ResponseEntity.ok(new ResponseObject("200", "Seat status checked successfully!", seatInfo));
        } catch (Exception e) {
            logger.error("[BookingController] Error checking seat status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error checking seat status: " + e.getMessage(), null));
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
            List<BookingDetailsResponse> bookingHistory = bookingService.getUserBookingHistory(userId);
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

    // Get booking by transaction reference
    @GetMapping("/txnRef/{txnRef}")
    public ResponseEntity<ResponseObject> getBookingByTxnRef(@PathVariable String txnRef) {
        try {
            BookingDetailsResponse bookingDetails = bookingService.getBookingWithDetails(txnRef);
            logger.info(bookingDetails.getMovie().getTitle());
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Booking retrieved successfully!", bookingDetails));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ResponseObject("ERROR", "Booking not found: " + e.getMessage(), null));
        }
    }

    // Confirm payment and generate tickets
    @PostMapping("/confirm-payment/{txnRef}")
    public ResponseEntity<ResponseObject> confirmPayment(@PathVariable String txnRef) {
        try {
            Booking booking = bookingService.confirmPaymentAndGenerateTickets(txnRef);
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Payment confirmed and tickets generated!", booking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("ERROR", "Error confirming payment: " + e.getMessage(), null));
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

    /**
     * Test endpoint to check email configuration
     */
    @GetMapping("/test-email")
    public ResponseEntity<?> testEmail() {
        try {
            emailService.sendBookingConfirmationWithHtml(
                "dinhhoang22072004@gmail.com", 
                "Test Email - Cinema System", 
                "<h1>Test Email</h1><p>This is a test email from Cinema System.</p>"
            );
            return ResponseEntity.ok("Test email sent successfully");
        } catch (Exception e) {
            logger.error("Failed to send test email", e);
            return ResponseEntity.status(500).body("Error sending test email: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to check HTML email sending
     */
    @PostMapping("/test-html-email")
    public ResponseEntity<?> testHtmlEmail(@RequestBody Map<String, String> body) {
        try {
            String htmlContent = body.get("htmlContent");
            String toEmail = body.getOrDefault("toEmail", "dinhhoang22072004@gmail.com");
            
            if (htmlContent == null || htmlContent.isEmpty()) {
                return ResponseEntity.badRequest().body("Missing htmlContent");
            }
            
            emailService.sendBookingConfirmationWithHtml(
                toEmail, 
                "Test HTML Email - Cinema System", 
                htmlContent
            );
            return ResponseEntity.ok("Test HTML email sent successfully");
        } catch (Exception e) {
            logger.error("Failed to send test HTML email", e);
            return ResponseEntity.status(500).body("Error sending test HTML email: " + e.getMessage());
        }
    }

    /**
     * Endpoint to send email with HTML content from frontend
     */
    @PostMapping("/{id}/send-email")
    public ResponseEntity<?> sendEmail(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String htmlContent = body.get("htmlContent");
        String subject = body.get("subject");
        String toEmail = body.get("toEmail");
        
        if (htmlContent == null || htmlContent.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing htmlContent");
        }
        if (subject == null || subject.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing subject");
        }
        if (toEmail == null || toEmail.isEmpty()) {
            // Get email from booking if not provided
            try {
                Booking booking = bookingService.getBookingById(id);
                toEmail = booking.getCustomerEmail();
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Missing toEmail and cannot get from booking");
            }
        }
        
        try {
            logger.info("[BOOKING] Sending email to: " + toEmail);
            logger.info("[BOOKING] Subject: " + subject);
            logger.info("[BOOKING] HTML content length: " + (htmlContent != null ? htmlContent.length() : 0));
            
            emailService.sendBookingConfirmationWithHtml(toEmail, subject, htmlContent);
            
            logger.info("[BOOKING] Email sent successfully to: " + toEmail);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            logger.error("Failed to send email", e);
            System.err.println("[BOOKING] Failed to send email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending email: " + e.getMessage());
        }
    }
}
