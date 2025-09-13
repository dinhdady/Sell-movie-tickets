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
@Table(name = "Seats")
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String seatNumber; // Ví dụ: A1, A2, B1, B2...

    @Column(name = "seat_row", nullable = false)
    private String rowNumber; // Ví dụ: A, B, C...

    @Column(name = "seat_column", nullable = false)
    private Integer columnNumber; // Ví dụ: 1, 2, 3...

    @ManyToOne
    @JoinColumn(name = "roomId", nullable = false)
    @JsonBackReference
    private Room room;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }

    // One seat can be booked for many showtimes
    @OneToMany(mappedBy = "seat", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ShowtimeSeatBooking> showtimeSeatBookings;

    public Seat(String seatNumber, String rowNumber, Integer columnNumber, Room room) {
        this.seatNumber = seatNumber;
        this.rowNumber = rowNumber;
        this.columnNumber = columnNumber;
        this.room = room;
    }
}
