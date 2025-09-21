package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.FilmRating;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

/**
 * Data Transfer Object cho Movie – chỉ chứa dữ liệu cần truyền ra/vào API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieDTO {

    private String title;
    private String description;
    private int duration;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date releaseDate;

    private String genre;
    private String director;
    private String trailerUrl;
    private String language;
    private String cast;
    private double rating;
    private String status;
    private double price;

    /** Mức phân loại phim (enum) */
    private FilmRating filmRating;
    
    // Custom setter for filmRating to handle string conversion
    public void setFilmRating(String filmRatingStr) {
        if (filmRatingStr != null && !filmRatingStr.trim().isEmpty()) {
            this.filmRating = FilmRating.fromValue(filmRatingStr);
        }
    }
    
    public void setFilmRating(FilmRating filmRating) {
        this.filmRating = filmRating;
    }
}
