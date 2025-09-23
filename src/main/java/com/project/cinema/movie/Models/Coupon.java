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
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;
    
    @Column(nullable = false)
    private Double discountValue;
    
    @Column(nullable = false)
    private Double minimumOrderAmount;
    
    @Column(nullable = false)
    private Double maximumDiscountAmount;
    
    @Column(nullable = false)
    private Integer totalQuantity;
    
    @Column(nullable = false)
    private Integer usedQuantity = 0;
    
    @Column(nullable = false)
    private Integer remainingQuantity;
    
    @Column(nullable = false)
    private LocalDateTime startDate;
    
    @Column(nullable = false)
    private LocalDateTime endDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponStatus status = CouponStatus.ACTIVE;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "coupon", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CouponUsage> usages;
    
    // Constructor để tự động tính remainingQuantity
    public Coupon(String code, String name, String description, CouponType type, 
                  Double discountValue, Double minimumOrderAmount, Double maximumDiscountAmount,
                  Integer totalQuantity, LocalDateTime startDate, LocalDateTime endDate) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.type = type;
        this.discountValue = discountValue;
        this.minimumOrderAmount = minimumOrderAmount;
        this.maximumDiscountAmount = maximumDiscountAmount;
        this.totalQuantity = totalQuantity;
        this.usedQuantity = 0;
        this.remainingQuantity = totalQuantity;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = CouponStatus.ACTIVE;
        this.isActive = true;
    }
    
    // Method để kiểm tra coupon có thể sử dụng không
    public boolean isUsable() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && 
               status == CouponStatus.ACTIVE && 
               remainingQuantity > 0 && 
               now.isAfter(startDate) && 
               now.isBefore(endDate);
    }
    
    // Method để tính discount amount
    public Double calculateDiscount(Double orderAmount) {
        if (!isUsable() || orderAmount < minimumOrderAmount) {
            return 0.0;
        }
        
        Double discount = 0.0;
        if (type == CouponType.PERCENTAGE) {
            discount = orderAmount * (discountValue / 100);
        } else if (type == CouponType.FIXED_AMOUNT) {
            discount = discountValue;
        }
        
        // Áp dụng maximum discount
        if (discount > maximumDiscountAmount) {
            discount = maximumDiscountAmount;
        }
        
        return discount;
    }
    
    // Method để sử dụng coupon
    public void useCoupon() {
        if (remainingQuantity > 0) {
            int oldUsed = this.usedQuantity;
            int oldRemaining = this.remainingQuantity;
            
            this.usedQuantity++;
            this.remainingQuantity--;
            
            System.out.println("[Coupon] useCoupon() - Code: " + this.code + 
                ", Used: " + oldUsed + " -> " + this.usedQuantity + 
                ", Remaining: " + oldRemaining + " -> " + this.remainingQuantity);
            
            // Tự động deactivate nếu hết coupon
            if (remainingQuantity <= 0) {
                this.status = CouponStatus.EXHAUSTED;
                System.out.println("[Coupon] Code: " + this.code + " is now EXHAUSTED");
            }
        } else {
            System.out.println("[Coupon] useCoupon() - Code: " + this.code + " has no remaining quantity");
        }
    }
}
