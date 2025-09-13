package com.project.cinema.movie.Models;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Data
@Table(name = "Payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bookingId", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private double amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    public enum PaymentMethod {
        VNPAY,MOMO,CREDITCARD
    }

    public enum PaymentStatus {
        SUCCESS, FAILED
    }

}
