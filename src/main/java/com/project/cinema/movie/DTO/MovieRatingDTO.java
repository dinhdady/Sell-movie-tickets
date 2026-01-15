package com.project.cinema.movie.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieRatingDTO {
    private Long id;
    private String userId;
    private String username;
    private String userFullName;
    private Long movieId;
    private String movieTitle;
    private Integer rating;
    private String review;
    private Boolean isVerified;
    private Integer isHelpful;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
