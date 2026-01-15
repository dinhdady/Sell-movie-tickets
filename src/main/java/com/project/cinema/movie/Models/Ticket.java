package com.project.cinema.movie.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Data
@Table(name = "Tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "orderId", nullable = false)
    @JsonBackReference
    private Order order;

    @ManyToOne
    @JoinColumn(name = "seatId", nullable = false)
    private Seat seat;
    @Column(unique = true, nullable = false)
    private String token;
    private double price;
    private boolean isUsed;
    @Enumerated(EnumType.STRING)
    private TicketStatus status;
    
    @Column(name = "qr_code_url")
    private String qrCodeUrl;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    @PrePersist
    protected void generateToken() {
        this.createdAt = new Date();
        this.token = UUID.randomUUID().toString(); // Sinh mã token duy nhất
        this.isUsed = false;
    }

}

