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

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    private SeatType seatType; // Loại ghế: REGULAR, VIP, COUPLE

    @Column(name = "price", nullable = false)
    private Double price; // Giá ghế

    @ManyToOne
    @JoinColumn(name = "roomId", nullable = false)
    @JsonIgnore
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
    @JsonIgnore
    private List<ShowtimeSeatBooking> showtimeSeatBookings;

    private String status; // AVAILABLE, BOOKED, SELECTED, OCCUPIED

    public Seat(String seatNumber, String rowNumber, Integer columnNumber, Room room) {
        this.seatNumber = seatNumber;
        this.rowNumber = rowNumber;
        this.columnNumber = columnNumber;
        this.room = room;
        this.seatType = SeatType.REGULAR; // Default seat type
    }

    public Seat(String seatNumber, String rowNumber, Integer columnNumber, Room room, SeatType seatType) {
        this.seatNumber = seatNumber;
        this.rowNumber = rowNumber;
        this.columnNumber = columnNumber;
        this.room = room;
        this.seatType = seatType;
    }
}
