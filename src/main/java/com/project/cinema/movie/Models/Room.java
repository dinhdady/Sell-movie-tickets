package com.project.cinema.movie.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private int capacity;

    @ManyToOne
    @JoinColumn(name = "cinemaId", nullable = false)
    @JsonIgnore
    private Cinema cinema;

    // Transient field for frontend - not stored in database
    @Transient
    private Long cinemaId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // One room can have many showtimes (different time slots)
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Showtime> showtimes;

    // One room has many seats
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Seat> seats;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date(); // Thiết lập createdAt với ngày giờ hiện tại
    }

    // Custom getter for cinemaId (transient field)
    public Long getCinemaId() {
        return cinema != null ? cinema.getId() : cinemaId;
    }

    public void setCinemaId(Long cinemaId) {
        this.cinemaId = cinemaId;
    }
}
