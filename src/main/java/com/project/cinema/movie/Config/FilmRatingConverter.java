package com.project.cinema.movie.Config;

import com.project.cinema.movie.Models.FilmRating;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class FilmRatingConverter implements Converter<String, FilmRating> {
    
    @Override
    public FilmRating convert(String source) {
        System.out.println("[FilmRatingConverter] Converting: '" + source + "'");
        
        if (source == null || source.trim().isEmpty()) {
            System.out.println("[FilmRatingConverter] Source is null or empty, returning null");
            return null;
        }
        
        try {
            FilmRating result = FilmRating.fromValue(source);
            System.out.println("[FilmRatingConverter] Conversion successful: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("[FilmRatingConverter] Conversion failed: " + e.getMessage());
            // Return null instead of throwing exception to allow validation to handle it
            return null;
        }
    }
}
