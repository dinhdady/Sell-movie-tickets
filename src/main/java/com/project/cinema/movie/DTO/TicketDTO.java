package com.project.cinema.movie.DTO;

import com.project.cinema.movie.Models.Order;
import jakarta.persistence.Transient;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TicketDTO {
    @JsonIgnore
    private Long id;
    @JsonIgnore
    private Long orderId;
    @JsonIgnore
    private Long seatId;
    private Double price;
    private String token;
    private String status;
    private String qrCodeUrl;
    @Transient
    private String qrCid;
    @Transient
    private String qrBase64;
    private SeatDTO seat;
}
