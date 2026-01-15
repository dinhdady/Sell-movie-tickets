package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.DTO.TicketDetailsResponse;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.Ticket;
import com.project.cinema.movie.Repositories.TicketRepository;
import com.project.cinema.movie.Services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class TestController {

    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private TicketRepository ticketRepository;

    // Test endpoint hoàn toàn không cần auth - lấy bookings
    @GetMapping("/bookings")
    public ResponseEntity<ResponseObject> testBookings() {
        try {
            List<BookingDetailsResponse> bookings = bookingService.getAllBookingsWithDetails();
            return ResponseEntity.ok(new ResponseObject("200", "Test endpoint works! Bookings retrieved successfully!", bookings));
        } catch (Exception e) {
            return ResponseEntity.ok(new ResponseObject("500", "Test endpoint error: " + e.getMessage(), null));
        }
    }
    
    // Test endpoint đơn giản
    @GetMapping("/hello")
    public ResponseEntity<ResponseObject> testHello() {
        return ResponseEntity.ok(new ResponseObject("200", "Hello from test endpoint!", "Test successful"));
    }
    
    // Test endpoint kiểm tra database
    @GetMapping("/database")
    public ResponseEntity<ResponseObject> testDatabase() {
        try {
            // Kiểm tra số lượng tickets
            long ticketCount = ticketRepository.count();
            
            // Kiểm tra số lượng bookings
            List<BookingDetailsResponse> bookings = bookingService.getAllBookingsWithDetails();
            
            Map<String, Object> result = new HashMap<>();
            result.put("ticketCount", ticketCount);
            result.put("bookingCount", bookings.size());
            result.put("hasData", ticketCount > 0 || bookings.size() > 0);
            result.put("message", "Database check successful!");
            
            return ResponseEntity.ok(new ResponseObject("200", "Database check successful!", result));
        } catch (Exception e) {
            return ResponseEntity.ok(new ResponseObject("500", "Database check failed: " + e.getMessage(), null));
        }
    }
    
    // Test endpoint lấy tất cả tickets
    @GetMapping("/tickets")
    public ResponseEntity<ResponseObject> testTickets() {
        try {
            List<Ticket> tickets = ticketRepository.findAll();
            List<TicketDetailsResponse> ticketDetails = tickets.stream()
                .map(this::buildTicketDetailsResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok(new ResponseObject("200", "Tickets retrieved successfully!", ticketDetails));
        } catch (Exception e) {
            return ResponseEntity.ok(new ResponseObject("500", "Error retrieving tickets: " + e.getMessage(), null));
        }
    }
    
    // Test endpoint tạo dữ liệu mẫu
    @PostMapping("/create-sample-data")
    public ResponseEntity<ResponseObject> createSampleData() {
        try {
            // Tạo dữ liệu mẫu cho testing
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Sample data creation endpoint - implement data creation logic here");
            result.put("note", "This endpoint should create sample bookings, tickets, and related data");
            
            return ResponseEntity.ok(new ResponseObject("200", "Sample data creation endpoint ready!", result));
        } catch (Exception e) {
            return ResponseEntity.ok(new ResponseObject("500", "Error creating sample data: " + e.getMessage(), null));
        }
    }
    
    // Test endpoint lấy tickets với token thực
    @GetMapping("/tickets-with-tokens")
    public ResponseEntity<ResponseObject> getTicketsWithTokens() {
        try {
            List<Ticket> tickets = ticketRepository.findAll();
            List<Map<String, Object>> ticketData = new ArrayList<>();
            
            for (Ticket ticket : tickets) {
                Map<String, Object> ticketInfo = new HashMap<>();
                ticketInfo.put("id", ticket.getId());
                ticketInfo.put("token", ticket.getToken());
                ticketInfo.put("price", ticket.getPrice());
                ticketInfo.put("status", ticket.getStatus() != null ? ticket.getStatus().name() : "UNKNOWN");
                ticketInfo.put("qrCodeUrl", ticket.getQrCodeUrl());
                ticketInfo.put("used", ticket.isUsed());
                ticketInfo.put("createdAt", ticket.getCreatedAt());
                
                // Thông tin seat
                if (ticket.getSeat() != null) {
                    Map<String, Object> seatInfo = new HashMap<>();
                    seatInfo.put("seatNumber", ticket.getSeat().getSeatNumber());
                    seatInfo.put("seatType", ticket.getSeat().getSeatType() != null ? ticket.getSeat().getSeatType().name() : "UNKNOWN");
                    seatInfo.put("rowNumber", ticket.getSeat().getRowNumber());
                    seatInfo.put("columnNumber", ticket.getSeat().getColumnNumber());
                    ticketInfo.put("seat", seatInfo);
                }
                
                // Thông tin order
                if (ticket.getOrder() != null) {
                    Map<String, Object> orderInfo = new HashMap<>();
                    orderInfo.put("id", ticket.getOrder().getId());
                    orderInfo.put("customerEmail", ticket.getOrder().getCustomerEmail());
                    orderInfo.put("totalPrice", ticket.getOrder().getTotalPrice());
                    orderInfo.put("status", ticket.getOrder().getStatus());
                    ticketInfo.put("order", orderInfo);
                }
                
                ticketData.add(ticketInfo);
            }
            
            return ResponseEntity.ok(new ResponseObject("200", "Tickets with tokens retrieved successfully!", ticketData));
        } catch (Exception e) {
            return ResponseEntity.ok(new ResponseObject("500", "Error retrieving tickets with tokens: " + e.getMessage(), null));
        }
    }
    
    
    private TicketDetailsResponse buildTicketDetailsResponse(Ticket ticket) {
        TicketDetailsResponse response = new TicketDetailsResponse();
        response.setId(ticket.getId());
        response.setToken(ticket.getToken());
        response.setPrice(ticket.getPrice());
        response.setUsed(ticket.isUsed());
        response.setStatus(ticket.getStatus() != null ? ticket.getStatus().name() : "UNKNOWN");
        response.setQrCodeUrl(ticket.getQrCodeUrl());
        response.setCreatedAt(ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : "");
        response.setUpdatedAt(ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().toString() : "");
        
        // Thông tin seat
        if (ticket.getSeat() != null) {
            response.setSeatNumber(ticket.getSeat().getSeatNumber());
            response.setSeatType(ticket.getSeat().getSeatType() != null ? ticket.getSeat().getSeatType().name() : "UNKNOWN");
            response.setRowNumber(ticket.getSeat().getRowNumber());
            response.setColumnNumber(ticket.getSeat().getColumnNumber());
        }
        
        // Thông tin order
        if (ticket.getOrder() != null) {
            response.setOrderId(ticket.getOrder().getId());
            response.setCustomerEmail(ticket.getOrder().getCustomerEmail());
            response.setTotalPrice(ticket.getOrder().getTotalPrice());
            response.setOrderStatus(ticket.getOrder().getStatus() != null ? ticket.getOrder().getStatus() : "UNKNOWN");
            
            // Lấy thông tin từ booking đầu tiên (nếu có)
            if (ticket.getOrder().getBookings() != null && !ticket.getOrder().getBookings().isEmpty()) {
                var booking = ticket.getOrder().getBookings().get(0);
                response.setBookingId(booking.getId());
                response.setShowtimeId(booking.getShowtime() != null ? booking.getShowtime().getId() : null);
                response.setStartTime(booking.getShowtime() != null ? booking.getShowtime().getStartTime().toString() : null);
                response.setEndTime(booking.getShowtime() != null ? booking.getShowtime().getEndTime().toString() : null);
                
                // Thông tin movie
                if (booking.getShowtime() != null && booking.getShowtime().getMovie() != null) {
                    response.setMovieId(booking.getShowtime().getMovie().getId());
                    response.setMovieTitle(booking.getShowtime().getMovie().getTitle());
                    response.setMoviePosterUrl(booking.getShowtime().getMovie().getPosterUrl());
                }
                
                // Thông tin room và cinema
                if (booking.getShowtime() != null && booking.getShowtime().getRoom() != null) {
                    response.setRoomId(booking.getShowtime().getRoom().getId());
                    response.setRoomName(booking.getShowtime().getRoom().getName());
                    
                    if (booking.getShowtime().getRoom().getCinema() != null) {
                        response.setCinemaId(booking.getShowtime().getRoom().getCinema().getId());
                        response.setCinemaName(booking.getShowtime().getRoom().getCinema().getName());
                        response.setCinemaAddress(booking.getShowtime().getRoom().getCinema().getAddress());
                    }
                }
            }
        }
        
        return response;
    }
}
