package com.project.cinema.movie.Models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "rating_helpful")
public class RatingHelpful {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rating_id", nullable = false)
    private MovieRating rating;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_helpful", nullable = false)
    private Boolean isHelpful; // true = helpful, false = not helpful

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor
    public RatingHelpful(MovieRating rating, User user, Boolean isHelpful) {
        this.rating = rating;
        this.user = user;
        this.isHelpful = isHelpful;
        this.createdAt = LocalDateTime.now();
    }
}
