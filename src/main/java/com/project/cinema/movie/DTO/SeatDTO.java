package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.SeatType;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class SeatDTO {
    private String seatNumber;
    private String rowNumber;
    private Integer columnNumber;
    @JsonIgnore
    private Long roomId;
    private SeatType seatType;
    private Double price;
    
    // Không include Room để tránh circular reference
}
