package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.FilmRating;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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
    private FilmRating filmRating; // Optional field
    
    // Custom setter for filmRating to handle String conversion
    public void setFilmRating(String filmRatingStr) {
        System.out.println("[MovieDTO] setFilmRating called with: '" + filmRatingStr + "'");
        if (filmRatingStr != null && !filmRatingStr.trim().isEmpty()) {
            try {
                this.filmRating = FilmRating.fromValue(filmRatingStr);
                System.out.println("[MovieDTO] Successfully converted to: " + this.filmRating);
            } catch (Exception e) {
                System.err.println("[MovieDTO] Error converting filmRating: " + e.getMessage());
                throw e;
            }
        } else {
            this.filmRating = null;
            System.out.println("[MovieDTO] filmRating set to null");
        }
    }
    
    // Regular setter for FilmRating enum
    public void setFilmRating(FilmRating filmRating) {
        System.out.println("[MovieDTO] setFilmRating called with enum: " + filmRating);
        this.filmRating = filmRating;
    }
}

// Custom converter for Spring
@Component
class StringToFilmRatingConverter implements Converter<String, FilmRating> {
    
    @Override
    public FilmRating convert(String source) {
        System.out.println("[StringToFilmRatingConverter] Converting: '" + source + "'");
        if (source == null || source.trim().isEmpty()) {
            return null;
        }
        try {
            FilmRating result = FilmRating.fromValue(source);
            System.out.println("[StringToFilmRatingConverter] Converted to: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("[StringToFilmRatingConverter] Error converting: " + e.getMessage());
            throw e;
        }
    }
}
