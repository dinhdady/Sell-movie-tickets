package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.CinemaType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CinemaDTO {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private CinemaType cinemaType;
}
