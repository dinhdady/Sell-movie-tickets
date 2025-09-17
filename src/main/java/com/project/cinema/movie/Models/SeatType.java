package com.project.cinema.movie.Models;

public enum SeatType {
    REGULAR("Ghế thường"),
    VIP("Ghế VIP"),
    COUPLE("Ghế đôi");

    private final String displayName;

    SeatType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
