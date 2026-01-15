package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private String userId;
    private Long showtimeId;
    private double totalPrice;
    private String customerEmail;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private List<TicketDTO> tickets;
}
