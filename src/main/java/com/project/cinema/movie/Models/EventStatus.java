package com.project.cinema.movie.Models;

public enum EventStatus {
    ACTIVE("Hoạt động"),
    INACTIVE("Không hoạt động"),
    EXPIRED("Hết hạn"),
    CANCELLED("Đã hủy");
    
    private final String displayName;
    
    EventStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
