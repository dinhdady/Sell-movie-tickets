package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private boolean success;
    private String accessToken;

    private String refreshToken;
    private String message;
}
