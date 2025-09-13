package com.project.cinema.movie.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true) // Allow null for guest bookings
    @JsonBackReference
    private User user;

    @ManyToOne
    @JoinColumn(name = "showtime_id", nullable = false)
    @JsonBackReference // Ngăn vòng lặp khi trả về JSON
    @ToString.Exclude  // Ngăn vòng lặp khi gọi toString()
    private Showtime showtime;
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = true) // Cho phép order_id là null
    @JsonBackReference  // Ngăn vòng lặp
    private Order order;

    private double totalPrice;
    
    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.CONFIRMED;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;
    
    @ElementCollection
    @CollectionTable(name = "booking_seat_ids", joinColumns = @JoinColumn(name = "booking_id"))
    @Column(name = "seat_id")
    private List<Long> seatIds;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
    }

    public Booking(User user, Showtime showtime, Order order, double totalPrice) {
        this.user = user;
        this.showtime = showtime;
        this.order = order;
        this.totalPrice = totalPrice;
    }
}

