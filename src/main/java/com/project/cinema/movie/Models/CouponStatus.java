package com.project.cinema.movie.Models;

public enum CouponStatus {
    ACTIVE("Hoạt động"),
    INACTIVE("Không hoạt động"),
    EXPIRED("Hết hạn"),
    EXHAUSTED("Hết số lượng");
    
    private final String displayName;
    
    CouponStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
