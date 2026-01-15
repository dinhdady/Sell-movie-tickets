package com.project.cinema.movie.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Payment method is required")
    private String paymentMethod; // VNPAY, MOMO, ZALOPAY, etc.
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
    
    private String returnUrl;
    private String cancelUrl;
    private String description;
}
