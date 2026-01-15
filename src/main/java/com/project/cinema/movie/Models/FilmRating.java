package com.project.cinema.movie.Models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum FilmRating {
    G("G"),
    PG("PG"),
    R("R"),
    PG_13("PG-13"),
    NC_17("NC-17");
    
    private final String label;

    FilmRating(String label) {
        this.label = label;
    }
    
    @JsonValue
    public String getLabel() {
        return label;
    }
    
    @JsonCreator
    public static FilmRating fromValue(String value) {
        System.out.println("[FilmRating] fromValue called with: '" + value + "'");
        System.out.println("[FilmRating] Value type: " + (value != null ? value.getClass().getSimpleName() : "null"));
        
        if (value == null || value.trim().isEmpty()) {
            System.out.println("[FilmRating] Value is null or empty, returning null");
            return null; // Allow null values
        }
        
        String normalizedValue = value.trim().toUpperCase();
        System.out.println("[FilmRating] Normalized value: '" + normalizedValue + "'");
        
        // Try exact match first
        for (FilmRating rating : FilmRating.values()) {
            System.out.println("[FilmRating] Comparing with enum: " + rating.name() + " (label: '" + rating.label + "')");
            if (rating.label.equalsIgnoreCase(normalizedValue)) {
                System.out.println("[FilmRating] Found exact match: " + rating.name());
                return rating;
            }
        }
        
        // Try variations for PG-13
        System.out.println("[FilmRating] Trying PG-13 variations...");
        if ("PG13".equals(normalizedValue) || 
            "PG_13".equals(normalizedValue) || 
            "PG 13".equals(normalizedValue) ||
            "PG-13".equals(normalizedValue)) {
            System.out.println("[FilmRating] Found PG-13 variation match");
            return PG_13;
        }
        
        // Try other variations
        System.out.println("[FilmRating] Trying other variations...");
        switch (normalizedValue) {
            case "G":
            case "GENERAL":
                System.out.println("[FilmRating] Found G match");
                return G;
            case "PG":
            case "PARENTAL GUIDANCE":
                System.out.println("[FilmRating] Found PG match");
                return PG;
            case "R":
            case "RESTRICTED":
                System.out.println("[FilmRating] Found R match");
                return R;
            case "NC17":
            case "NC_17":
            case "NC-17":
            case "NC 17":
                System.out.println("[FilmRating] Found NC-17 match");
                return NC_17;
            default:
                System.out.println("[FilmRating] No match found, throwing exception");
                throw new IllegalArgumentException("Unknown rating: '" + value + "'. Valid values are: G, PG, PG-13, R, NC-17");
        }
    }
    
    @Override
    public String toString() {
        return label;
    }
}
