package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.Ticket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class VNPayResponseDTO {
    private String status;
    private String message;
    private String orderId;
    private String txnRef; // Add txnRef field
    private List<Ticket> tickets;
    private List<String> qrCodes; // Add a list of QR codes
    private String customerEmail;
    private int ticketCount;
    private String movieTitle;
    private String cinemaName;
    private String roomName;
    private String showtime;
    
    // Constructor for backward compatibility
    public VNPayResponseDTO(String status, String message, String orderId, List<Ticket> tickets, List<String> qrCodes) {
        this.status = status;
        this.message = message;
        this.orderId = orderId;
        this.txnRef = orderId; // Use orderId as txnRef for backward compatibility
        this.tickets = tickets;
        this.qrCodes = qrCodes;
        this.ticketCount = tickets != null ? tickets.size() : 0;
        this.customerEmail = null;
        this.movieTitle = null;
        this.cinemaName = null;
        this.roomName = null;
        this.showtime = null;
    }
    
    // Constructor with all fields
    public VNPayResponseDTO(String status, String message, String orderId, List<Ticket> tickets, List<String> qrCodes, String customerEmail, int ticketCount, String movieTitle, String cinemaName, String roomName, String showtime) {
        this.status = status;
        this.message = message;
        this.orderId = orderId;
        this.txnRef = orderId; // Use orderId as txnRef for backward compatibility
        this.tickets = tickets;
        this.qrCodes = qrCodes;
        this.customerEmail = customerEmail;
        this.ticketCount = ticketCount;
        this.movieTitle = movieTitle;
        this.cinemaName = cinemaName;
        this.roomName = roomName;
        this.showtime = showtime;
    }
}
