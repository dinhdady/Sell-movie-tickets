package com.project.cinema.movie.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Data
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
    @JsonBackReference(value = "cinema-rooms")
    private Cinema cinema;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // One room can have many showtimes (different time slots)
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference(value = "room-showtimes")
    private List<Showtime> showtimes;

    // One room has many seats
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Seat> seats;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date(); // Thiết lập createdAt với ngày giờ hiện tại
    }
}
