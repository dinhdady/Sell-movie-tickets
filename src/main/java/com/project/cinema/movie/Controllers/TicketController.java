package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.TicketService;
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

    // Lấy tickets của user hiện tại (cho profile)
    @GetMapping("/my-tickets")
    public ResponseEntity<ResponseObject> getMyTickets(@RequestParam String userId) {
        try {
            List<BookingDetailsResponse> tickets = ticketService.getTicketsByUserId(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User tickets retrieved successfully!", tickets));
        } catch (Exception e) {
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