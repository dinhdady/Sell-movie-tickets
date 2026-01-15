package com.project.cinema.movie.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;
    
    @Column(nullable = false)
    private Double discountPercentage;
    
    @Column(nullable = false)
    private Double minimumOrderAmount;
    
    @Column(nullable = false)
    private Double maximumDiscountAmount;
    
    @Column(nullable = false)
    private LocalDateTime startDate;
    
    @Column(nullable = false)
    private LocalDateTime endDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.ACTIVE;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(length = 500)
    private String bannerUrl;
    
    @Column(length = 500)
    private String imageUrl;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventUsage> usages;
    
    // Constructor
    public Event(String name, String description, EventType type, 
                 Double discountPercentage, Double minimumOrderAmount, Double maximumDiscountAmount,
                 LocalDateTime startDate, LocalDateTime endDate) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.discountPercentage = discountPercentage;
        this.minimumOrderAmount = minimumOrderAmount;
        this.maximumDiscountAmount = maximumDiscountAmount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = EventStatus.ACTIVE;
        this.isActive = true;
    }
    
    // Method để kiểm tra event có hoạt động không
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && 
               status == EventStatus.ACTIVE && 
               now.isAfter(startDate) && 
               now.isBefore(endDate);
    }
    
    // Method để tính discount amount
    public Double calculateDiscount(Double orderAmount) {
        if (!isActive() || orderAmount < minimumOrderAmount) {
            return 0.0;
        }
        
        Double discount = orderAmount * (discountPercentage / 100);
        
        // Áp dụng maximum discount
        if (discount > maximumDiscountAmount) {
            discount = maximumDiscountAmount;
        }
        
        return discount;
    }
}
