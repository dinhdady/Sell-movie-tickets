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
@Data
@Table(name = "Cinemas")
public class Cinema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String name;
    private String address;
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "cinema_type")
    private CinemaType cinemaType;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // One cinema has many rooms
    @OneToMany(mappedBy = "cinema", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Room> rooms;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date(); // Thiết lập createdAt với ngày giờ hiện tại
    }

    public Cinema(String name, String address, String phone,CinemaType cinemaType) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.cinemaType = cinemaType;
    }
}
