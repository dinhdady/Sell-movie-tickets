package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.Ticket;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Ticket ticket;
    private String qrCode;
}
