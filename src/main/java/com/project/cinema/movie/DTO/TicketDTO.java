package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.Order;
import jakarta.persistence.Transient;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TicketDTO {
    private Long id;
    private Long orderId;
    private Long seatId;
    private Double price;
    private String token;
    private String status;
    @Transient
    private String qrCid;
    @Transient
    private String qrBase64;
    private SeatDTO seat;
}
