package com.project.cinema.movie.DTO;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class VnpayRequest {
    private String amount;
    private Long bookingId;
}

