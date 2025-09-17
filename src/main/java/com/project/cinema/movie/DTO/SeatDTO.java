package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.SeatType;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class SeatDTO {
    private String seatNumber;
    private String rowNumber;
    private Integer columnNumber;
    private Long roomId;
    private SeatType seatType;
    private Double price;
}
