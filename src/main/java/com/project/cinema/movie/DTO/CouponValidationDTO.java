package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CouponValidationDTO {
    
    private boolean valid;
    private String message;
    private Double discountAmount;
    private Double finalAmount;
    private CouponDTO coupon;
    
    public CouponValidationDTO(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }
    
    public CouponValidationDTO(boolean valid, String message, Double discountAmount, Double finalAmount, CouponDTO coupon) {
        this.valid = valid;
        this.message = message;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.coupon = coupon;
    }
}
