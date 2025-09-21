package com.project.cinema.movie.Services;

import com.google.zxing.WriterException;
import com.project.cinema.movie.DTO.TicketDTO;
import com.project.cinema.movie.DTO.TicketResponse;
import com.project.cinema.movie.Exception.ResourceNotFoundException;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.OrderRepository;
import com.project.cinema.movie.Repositories.SeatRepository;
import com.project.cinema.movie.Repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired; 
import com.project.cinema.movie.Services.QRCodeService; // Add this import
import org.springframework.stereotype.Service; 
import com.project.cinema.movie.Services.QRCodeService; // Add this import
import com.project.cinema.movie.Services.QRCodeService; // Add this import

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TicketService {
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private SeatRepository seatRepository;
    @Autowired
    private QRCodeService qrCodeService; // Inject QRCodeService
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id).orElse(null);
    }
    public TicketResponse createTicket(TicketDTO ticketDTO) throws IOException, WriterException {
        Order order = orderRepository.findById(ticketDTO.getOrderId()).orElse(null);
        Seat seat = seatRepository.findById(ticketDTO.getSeatId()).orElse(null);
        if (order == null || seat == null) {
            throw new RuntimeException("Booking id or seat id not found");
        }
        Ticket ticket = new Ticket();
        ticket.setToken(UUID.randomUUID().toString());
        ticket.setOrder(order);
        ticket.setSeat(seat);
        ticket.setPrice(ticketDTO.getPrice());
        ticket.setStatus(TicketStatus.PENDING);
        ticket = ticketRepository.save(ticket);
        String qrCode = qrCodeService.generateTicketQRCode(ticket.getId(), ticket.getToken());
        return new TicketResponse(ticket,qrCode);
    }

    public Ticket updateTicket(Long id, Ticket ticketDetails) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setPrice(ticketDetails.getPrice());
            return ticketRepository.save(ticket);
        }).orElseThrow(() -> new ResourceNotFoundException("Ticket cannot be found with id :" + id));
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }
    public Optional<Ticket> findByToken(String token){
        return ticketRepository.findByToken(token);
    }

    public Ticket save(Ticket ticket){return ticketRepository.save(ticket);}
}
