package com.project.cinema.movie.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_usages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventUsage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @Column(nullable = false)
    private Double originalAmount;
    
    @Column(nullable = false)
    private Double discountAmount;
    
    @Column(nullable = false)
    private Double finalAmount;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime usedAt;
    
    @Column(length = 500)
    private String notes;
    
    public EventUsage(Event event, User user, Booking booking, 
                     Double originalAmount, Double discountAmount, Double finalAmount) {
        this.event = event;
        this.user = user;
        this.booking = booking;
        this.originalAmount = originalAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
    }
}
