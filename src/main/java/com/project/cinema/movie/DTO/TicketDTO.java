package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.Order;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketDTO {
    private Long orderId;
    private Long seatId;
    private Double price;
}
