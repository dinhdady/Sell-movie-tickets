package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoomDTO {
    private String name;
    private int capacity;
    private Long cinemaId;

    // Getters and Setters
}