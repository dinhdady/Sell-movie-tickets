package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.Models.Booking;
import com.project.cinema.movie.Models.Ticket;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.Services.BookingService;
import com.project.cinema.movie.Services.TicketService;
import com.project.cinema.movie.Repositories.BookingRepository;
import com.project.cinema.movie.Repositories.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/bookings")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class BookingManagementController {

    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    private static final Logger logger = LoggerFactory.getLogger(BookingManagementController.class);
    // Test endpoint không cần auth - Lấy tất cả vé từ TicketService
    @GetMapping("/test")
    public ResponseEntity<ResponseObject> testEndpoint() {
        try {
            // Sử dụng TicketService để lấy tất cả vé của tất cả user
            List<BookingDetailsResponse> tickets = ticketService.getAllTicketsWithDetails();
            logger.info("[ADMIN] Found " + tickets.size() + " tickets from TicketService");
            
            // Log một vài ticket để debug
            if (!tickets.isEmpty()) {
                logger.info("[ADMIN] Sample ticket: " + tickets.get(0));
            }
            
            return ResponseEntity.ok(new ResponseObject("200", "Test endpoint works! All tickets retrieved successfully! Found " + tickets.size() + " tickets", tickets));
        } catch (Exception e) {
            System.err.println("[ADMIN] Error in test endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Test endpoint error: " + e.getMessage(), null));
        }
    }
    
    // Test endpoint đơn giản để kiểm tra dữ liệu
    @GetMapping("/debug")
    public ResponseEntity<ResponseObject> debugEndpoint() {
        try {
            // Lấy tất cả tickets từ database
            List<Ticket> allTickets = ticketRepository.findAll();
            logger.info("[ADMIN DEBUG] Found " + allTickets.size() + " tickets in database");
            
            // Lấy tất cả bookings từ database
            List<Booking> allBookings = bookingRepository.findAll();
            logger.info("[ADMIN DEBUG] Found " + allBookings.size() + " bookings in database");
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("totalTickets", allTickets.size());
            debugInfo.put("totalBookings", allBookings.size());
            debugInfo.put("tickets", allTickets.stream().limit(5).collect(Collectors.toList()));
            debugInfo.put("bookings", allBookings.stream().limit(5).collect(Collectors.toList()));
            
            return ResponseEntity.ok(new ResponseObject("200", "Debug info retrieved successfully!", debugInfo));
        } catch (Exception e) {
            System.err.println("[ADMIN DEBUG] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Debug error: " + e.getMessage(), null));
        }
    }

    // Lấy danh sách đặt vé với chi tiết đầy đủ - Sử dụng TicketService để lấy tất cả vé
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ResponseObject> getAllBookings() {
        try {
            // Sử dụng TicketService để lấy tất cả vé của tất cả user
            List<BookingDetailsResponse> tickets = ticketService.getAllTicketsWithDetails();
            return ResponseEntity.ok(new ResponseObject("200", "All tickets retrieved successfully! Found " + tickets.size() + " tickets", tickets));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving tickets: " + e.getMessage(), null));
        }
    }
    
    // Lấy danh sách đặt vé với phân trang và filter (giữ lại cho tương lai)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/filtered")
    public ResponseEntity<ResponseObject> getAllBookingsWithFilters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String movieTitle,
            @RequestParam(required = false) String username) {
        try {
            Page<Booking> bookings = bookingService.getAllBookingsWithFilters(page, size, status, movieTitle, username);
            return ResponseEntity.ok(new ResponseObject("200", "Bookings retrieved successfully!", bookings));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving bookings: " + e.getMessage(), null));
        }
    }

    // Lấy chi tiết đặt vé
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{bookingId}")
    public ResponseEntity<ResponseObject> getBookingById(@PathVariable Long bookingId) {
        try {
            Map<String, Object> bookingDetails = bookingService.getBookingDetails(bookingId);
            return ResponseEntity.ok(new ResponseObject("200", "Booking details retrieved successfully!", bookingDetails));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ResponseObject("404", "Booking not found: " + e.getMessage(), null));
        }
    }

    // Cập nhật trạng thái đặt vé
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{bookingId}/status")
    public ResponseEntity<ResponseObject> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            Booking updatedBooking = bookingService.updateBookingStatus(bookingId, newStatus);
            return ResponseEntity.ok(new ResponseObject("200", "Booking status updated successfully!", updatedBooking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating booking status: " + e.getMessage(), null));
        }
    }

    // Hủy đặt vé
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<ResponseObject> cancelBooking(@PathVariable Long bookingId) {
        try {
            bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok(new ResponseObject("200", "Booking cancelled successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error cancelling booking: " + e.getMessage(), null));
        }
    }

    // Thống kê đặt vé
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<ResponseObject> getBookingStats(
            @RequestParam(required = false) String period) {
        try {
            Map<String, Object> stats = bookingService.getBookingStats(period);
            return ResponseEntity.ok(new ResponseObject("200", "Booking statistics retrieved successfully!", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving booking statistics: " + e.getMessage(), null));
        }
    }

    // Lấy ghế có sẵn cho suất chiếu
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/showtime/{showtimeId}/seats")
    public ResponseEntity<ResponseObject> getShowtimeSeats(@PathVariable Long showtimeId) {
        try {
            Map<String, Object> seatInfo = bookingService.getShowtimeSeatInfo(showtimeId);
            return ResponseEntity.ok(new ResponseObject("200", "Showtime seat information retrieved successfully!", seatInfo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving seat information: " + e.getMessage(), null));
        }
    }

    // Tìm kiếm đặt vé
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<ResponseObject> searchBookings(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Booking> bookings = bookingService.searchBookings(query, page, size);
            return ResponseEntity.ok(new ResponseObject("200", "Bookings search completed successfully!", bookings));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error searching bookings: " + e.getMessage(), null));
        }
    }

    // Xuất báo cáo đặt vé
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/export")
    public ResponseEntity<ResponseObject> exportBookings(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String format) {
        try {
            Map<String, Object> exportData = bookingService.exportBookings(startDate, endDate, format);
            return ResponseEntity.ok(new ResponseObject("200", "Bookings exported successfully!", exportData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error exporting bookings: " + e.getMessage(), null));
        }
    }
} 