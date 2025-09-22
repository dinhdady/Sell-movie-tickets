package com.project.cinema.movie.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Tránh infinite recursion
    private List<Booking> bookings;
    private String txnRef;
    private double totalPrice;
    private String status;
    private String customerEmail;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Tránh infinite recursion
    private List<Ticket> tickets;
    private String transactionId;
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.txnRef = UUID.randomUUID().toString().substring(0,7);
    }

    public Order(User user, List<Booking> bookings, double totalPrice, String status, Date createdAt,String customerEmail) {
        this.user = user;
        this.bookings = bookings;
        this.totalPrice = totalPrice;
        this.status = status;
        this.customerEmail=customerEmail;
        this.createdAt = createdAt;
    }
}

