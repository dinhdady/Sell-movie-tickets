package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.TicketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class TicketController {

    @Autowired
    private TicketService ticketService;
    private static final Logger logger = LoggerFactory.getLogger(TicketController.class);
    // Lấy tất cả tickets (cho admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ResponseObject> getAllTickets() {
        try {
            List<BookingDetailsResponse> tickets = ticketService.getAllTicketsWithDetails();
            return ResponseEntity.ok(new ResponseObject("200", "Tickets retrieved successfully!", tickets));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving tickets: " + e.getMessage(), null));
        }
    }

    // Lấy tất cả tickets (không cần auth - cho admin management)
    @GetMapping("/getAllTickets")
    public ResponseEntity<ResponseObject> getAllTicketsNoAuth() {
        try {
            List<BookingDetailsResponse> tickets = ticketService.getAllTicketsWithDetails();
            logger.info("[TICKETS] Found " + tickets.size() + " tickets from getAllTickets endpoint");
            return ResponseEntity.ok(new ResponseObject("200", "All tickets retrieved successfully! Found " + tickets.size() + " tickets", tickets));
        } catch (Exception e) {
            logger.error("[TICKETS] Error in getAllTickets: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving tickets: " + e.getMessage(), null));
        }
    }

    // Lấy chi tiết ticket theo ID (cho admin modal)
    @GetMapping("/{id}/details")
    public ResponseEntity<ResponseObject> getTicketDetailsById(@PathVariable Long id) {
        try {
            BookingDetailsResponse ticketDetails = ticketService.getTicketDetailsById(id);
            logger.info("[TICKETS] Found ticket details for ID: " + id);
            return ResponseEntity.ok(new ResponseObject("200", "Ticket details retrieved successfully!", ticketDetails));
        } catch (Exception e) {
            logger.error("[TICKETS] Error in getTicketDetailsById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ResponseObject("404", "Ticket not found: " + e.getMessage(), null));
        }
    }

    // Lấy tickets của user hiện tại (cho profile)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/my-tickets")
    public ResponseEntity<ResponseObject> getMyTickets(
            @RequestParam(required = false) String userId,
            org.springframework.security.core.Authentication authentication) {
        try {
            // Nếu có userId trong request param, sử dụng nó
            // Nếu không, lấy từ authentication (JWT token)
            String finalUserId = userId;
            if (finalUserId == null || finalUserId.isEmpty()) {
                if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                    org.springframework.security.core.userdetails.UserDetails userDetails = 
                        (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
                    // Lấy username từ authentication và tìm user ID
                    // Cần inject UserService để lấy user ID từ username
                    // Tạm thời log để debug
                    logger.warn("[TICKETS] No userId provided, but authentication available. Username: {}", userDetails.getUsername());
                }
            }
            
            if (finalUserId == null || finalUserId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("400", "User ID is required", null));
            }
            
            List<BookingDetailsResponse> tickets = ticketService.getTicketsByUserId(finalUserId);
            logger.info("[TICKETS] Found {} tickets for user {}", tickets.size(), finalUserId);
            return ResponseEntity.ok(new ResponseObject("200", "User tickets retrieved successfully!", tickets));
        } catch (Exception e) {
            logger.error("[TICKETS] Error retrieving user tickets: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving user tickets: " + e.getMessage(), null));
        }
    }

    // Lấy tickets theo order ID
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ResponseObject> getTicketsByOrderId(@PathVariable Long orderId) {
        try {
            List<BookingDetailsResponse> tickets = ticketService.getTicketsByOrderId(orderId);
            return ResponseEntity.ok(new ResponseObject("200", "Order tickets retrieved successfully!", tickets));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving order tickets: " + e.getMessage(), null));
        }
    }

    // Test endpoint không cần auth
    @GetMapping("/test")
    public ResponseEntity<ResponseObject> testTickets() {
        try {
            List<BookingDetailsResponse> tickets = ticketService.getAllTicketsWithDetails();
            return ResponseEntity.ok(new ResponseObject("200", "Test tickets endpoint works! Found " + tickets.size() + " tickets", tickets));
        } catch (Exception e) {
            return ResponseEntity.ok(new ResponseObject("500", "Test tickets error: " + e.getMessage(), null));
        }
    }
}