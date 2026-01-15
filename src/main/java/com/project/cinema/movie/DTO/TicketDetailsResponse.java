package com.project.cinema.movie.DTO;

import lombok.Data;

@Data
public class TicketDetailsResponse {
    private Long id;
    private String token;
    private double price;
    private boolean used;
    private String status;
    private String qrCodeUrl;
    private String createdAt;
    private String updatedAt;
    
    // Seat information
    private String seatNumber;
    private String seatType;
    private String rowNumber;
    private int columnNumber;
    
    // Order information
    private Long orderId;
    private String customerEmail;
    private double totalPrice;
    private String orderStatus;
    
    // Booking information
    private Long bookingId;
    private Long showtimeId;
    private String startTime;
    private String endTime;
    
    // Movie information
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    
    // Room and Cinema information
    private Long roomId;
    private String roomName;
    private Long cinemaId;
    private String cinemaName;
    private String cinemaAddress;
}
