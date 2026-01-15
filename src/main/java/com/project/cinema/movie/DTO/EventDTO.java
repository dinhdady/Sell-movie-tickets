package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.EventType;
import com.project.cinema.movie.Models.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    
    private Long id;
    private String name;
    private String description;
    private EventType type;
    private Double discountPercentage;
    private Double minimumOrderAmount;
    private Double maximumDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private EventStatus status;
    private Boolean isActive;
    private String bannerUrl;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor từ Event entity
    public EventDTO(com.project.cinema.movie.Models.Event event) {
        this.id = event.getId();
        this.name = event.getName();
        this.description = event.getDescription();
        this.type = event.getType();
        this.discountPercentage = event.getDiscountPercentage();
        this.minimumOrderAmount = event.getMinimumOrderAmount();
        this.maximumDiscountAmount = event.getMaximumDiscountAmount();
        this.startDate = event.getStartDate();
        this.endDate = event.getEndDate();
        this.status = event.getStatus();
        this.isActive = event.getIsActive();
        this.bannerUrl = event.getBannerUrl();
        this.imageUrl = event.getImageUrl();
        this.createdAt = event.getCreatedAt();
        this.updatedAt = event.getUpdatedAt();
    }
}
