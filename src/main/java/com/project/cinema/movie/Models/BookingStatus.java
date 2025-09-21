package com.project.cinema.movie.Models;

public enum BookingStatus {
    PENDING,    // Chờ xác nhận
    CONFIRMED,  // Đã xác nhận
    PAID,       // Đã thanh toán
    CANCELLED,  // Đã hủy
    COMPLETED,  // Hoàn thành
    EXPIRED;     // Hết hạn
    // Get short value for database storage
    public String getShortValue() {
        switch (this) {
            case PENDING: return "P";
            case CONFIRMED: return "C";
            case PAID: return "P";
            case CANCELLED: return "X";
            case COMPLETED: return "D";
            case EXPIRED: return "E";
            default: return "P";
        }
    }
} 