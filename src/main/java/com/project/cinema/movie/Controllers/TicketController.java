package com.project.cinema.movie.Controllers;

import com.google.zxing.WriterException;
import com.project.cinema.movie.DTO.TicketDTO;
import com.project.cinema.movie.DTO.TicketResponse;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.Ticket;
import com.project.cinema.movie.Services.QRCodeService;
import com.project.cinema.movie.Services.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/ticket")
public class TicketController {
    @Autowired
    private TicketService ticketService;
    @Autowired
    private QRCodeService qrCodeService;
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping
    public List<Ticket> getAllTickets(){
        return ticketService.getAllTickets();
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getTicketById(@PathVariable Long id){
        Ticket found = ticketService.getTicketById(id);
        return found != null ? ResponseEntity.ok(new ResponseObject("OK","Found!",found))
                : ResponseEntity.status(404).body(new ResponseObject("404","Not found!",null));
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateTicket(@PathVariable Long id, @RequestBody Ticket ticket){
        Ticket updated = ticketService.updateTicket(id,ticket);
        return ResponseEntity.ok(new ResponseObject("OK","Updated!",updated));
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping
    public ResponseEntity<ResponseObject> createTicket(@RequestBody TicketDTO ticketDTO) throws IOException, WriterException {
        TicketResponse createdResponse = ticketService.createTicket(ticketDTO);
        Ticket createdTicket = createdResponse.getTicket();
        String qrCode = createdResponse.getQrCode();
        
        return ResponseEntity.ok(new ResponseObject("OK", "Success!", createdTicket));
    }
}
