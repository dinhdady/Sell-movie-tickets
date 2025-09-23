package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EventValidationDTO {
    
    private boolean valid;
    private String message;
    private Double discountAmount;
    private Double finalAmount;
    private EventDTO event;
    
    public EventValidationDTO(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }
    
    public EventValidationDTO(boolean valid, String message, Double discountAmount, Double finalAmount, EventDTO event) {
        this.valid = valid;
        this.message = message;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.event = event;
    }
}
