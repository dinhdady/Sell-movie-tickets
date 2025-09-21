package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.BookingDTO;
import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.ShowtimeRepository;
import com.project.cinema.movie.Services.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    private OrderService orderService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
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
        System.out.println("[BookingController] Received bookingDTO: " + bookingDTO);
        
        try {
            // Validate showtime
            Showtime showtime = showtimeRepository.findById(bookingDTO.getShowtimeId()).orElse(null);
            if (showtime == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("ERROR", "Showtime không hợp lệ.", null));
            }

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
            
            // Associate with existing Order if orderId is provided
            if (bookingDTO.getOrderId() != null) {
                Order order = orderService.findById(bookingDTO.getOrderId());

                booking.setOrder(order);
                System.out.println("[BookingController] Associated booking with order ID: " + order.getId());
            }

            // Save booking first
            Booking savedBooking = bookingService.save(booking);

            // Reserve seats for this showtime
            if (bookingDTO.getSeatIds() != null && !bookingDTO.getSeatIds().isEmpty()) {
                bookingService.reserveSeats(savedBooking.getId(), bookingDTO.getShowtimeId(), bookingDTO.getSeatIds());
                System.out.println("[BookingController] Reserved seats: " + bookingDTO.getSeatIds() + " for showtime: " + bookingDTO.getShowtimeId());
            }

            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Đặt vé thành công!", savedBooking));
            
        } catch (Exception e) {
            System.err.println("[BookingController] Error creating booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Lỗi khi tạo booking: " + e.getMessage(), null));
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
     * Test endpoint to check QR code email sending
     */
    @PostMapping("/test-qr-email")
    public ResponseEntity<?> testQrEmail(@RequestBody Map<String, String> body) {
        try {
            String toEmail = body.getOrDefault("toEmail", "dinhhoang22072004@gmail.com");
            String qrData = body.getOrDefault("qrData", "TEST_QR_CODE_123");
            
            // Create a simple QR code test email
            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Test QR Code Email</title>
                </head>
                <body>
                    <h1>Test QR Code Email</h1>
                    <p>This is a test email with QR code data: <strong>%s</strong></p>
                    <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                        <h3>QR Code Test</h3>
                        <p>QR Data: %s</p>
                        <p>Note: This is a test email. The actual QR code image would be generated by the frontend.</p>
                    </div>
                </body>
                </html>
                """, qrData, qrData);
            
            emailService.sendBookingConfirmationWithHtml(
                toEmail, 
                "Test QR Code Email - Cinema System", 
                htmlContent
            );
            return ResponseEntity.ok("Test QR code email sent successfully");
        } catch (Exception e) {
            logger.error("Failed to send test QR code email", e);
            return ResponseEntity.status(500).body("Error sending test QR code email: " + e.getMessage());
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
            System.out.println("🎯 [BOOKING] Sending email to: " + toEmail);
            System.out.println("🎯 [BOOKING] Subject: " + subject);
            System.out.println("🎯 [BOOKING] HTML content length: " + (htmlContent != null ? htmlContent.length() : 0));
            
            emailService.sendBookingConfirmationWithHtml(toEmail, subject, htmlContent);
            
            System.out.println("✅ [BOOKING] Email sent successfully to: " + toEmail);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            logger.error("Failed to send email", e);
            System.err.println("❌ [BOOKING] Failed to send email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending email: " + e.getMessage());
        }
    }
}
