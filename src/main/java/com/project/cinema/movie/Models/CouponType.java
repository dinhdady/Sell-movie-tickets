package com.project.cinema.movie.Models;

public enum CouponType {
    PERCENTAGE("Phần trăm"),
    FIXED_AMOUNT("Số tiền cố định");
    
    private final String displayName;
    
    CouponType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
