package com.project.cinema.movie.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String paymentUrl;
    private String transactionId;
    private String paymentMethod;
    private String status;
    private String message;
    private Long amount;
    private String currency;
    private String returnUrl;
    private String cancelUrl;
}
