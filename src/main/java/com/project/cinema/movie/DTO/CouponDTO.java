package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.CouponType;
import com.project.cinema.movie.Models.CouponStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {
    
    private Long id;
    private String code;
    private String name;
    private String description;
    private CouponType type;
    private Double discountValue;
    private Double minimumOrderAmount;
    private Double maximumDiscountAmount;
    private Integer totalQuantity;
    private Integer usedQuantity;
    private Integer remainingQuantity;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private CouponStatus status;
    private Boolean isActive;
    private String bannerUrl;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor từ Coupon entity
    public CouponDTO(com.project.cinema.movie.Models.Coupon coupon) {
        this.id = coupon.getId();
        this.code = coupon.getCode();
        this.name = coupon.getName();
        this.description = coupon.getDescription();
        this.type = coupon.getType();
        this.discountValue = coupon.getDiscountValue();
        this.minimumOrderAmount = coupon.getMinimumOrderAmount();
        this.maximumDiscountAmount = coupon.getMaximumDiscountAmount();
        this.totalQuantity = coupon.getTotalQuantity();
        this.usedQuantity = coupon.getUsedQuantity();
        this.remainingQuantity = coupon.getRemainingQuantity();
        this.startDate = coupon.getStartDate();
        this.endDate = coupon.getEndDate();
        this.status = coupon.getStatus();
        this.isActive = coupon.getIsActive();
        this.createdAt = coupon.getCreatedAt();
        this.updatedAt = coupon.getUpdatedAt();
    }
}
