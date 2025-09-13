package com.project.cinema.movie.Models;


public enum CinemaType {
    STANDARD("Standard Cinema"),
    SPECIAL("Special Cinema"),
    VIP("VIP Cinema");

    private final String description;

    CinemaType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
